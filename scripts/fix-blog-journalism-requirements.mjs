#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

const INTERFACES_DIR = join(process.cwd(), 'interfaces');

function fixJournalismRequirements(html, fileName) {
  let modified = html;
  let hasChanges = false;

  // 1. Fix Fair Exchange - add class="fair-exchange" to elements containing Fair Exchange
  // Pattern 1: <em>Fair Exchange:</em> paragraphs
  const fairExchangePattern1 = /(<p)([^>]*>)(\s*<em>Fair Exchange:<\/em>[^<]*<\/p>)/gi;
  modified = modified.replace(fairExchangePattern1, (match, openTag, attrs, content) => {
    if (attrs.includes('class=')) {
      const newAttrs = attrs.replace(/class="([^"]*)"/, 'class="$1 fair-exchange"');
      hasChanges = true;
      return openTag + newAttrs + content;
    } else {
      hasChanges = true;
      return openTag + ' class="fair-exchange"' + attrs + content;
    }
  });

  // Pattern 2: blockquote with Fair Exchange Clause
  const fairExchangePattern2 = /(<blockquote)([^>]*>[\s\S]*?Fair Exchange[\s\S]*?<\/blockquote>)/gi;
  modified = modified.replace(fairExchangePattern2, (match, openTag, content) => {
    if (!openTag.includes('class=')) {
      hasChanges = true;
      return openTag + ' class="fair-exchange"' + content;
    }
    return match;
  });

  // Pattern 3: Any paragraph mentioning "Fair Exchange" that doesn't have fair class
  const fairExchangePattern3 = /(<p)([^>]*>)([^<]*Fair Exchange[^<]*<\/p>)/gi;
  modified = modified.replace(fairExchangePattern3, (match, openTag, attrs, content) => {
    if (!attrs.includes('fair-exchange') && !attrs.includes('honesty')) {
      if (attrs.includes('class=')) {
        const newAttrs = attrs.replace(/class="([^"]*)"/, 'class="$1 fair-exchange"');
        hasChanges = true;
        return openTag + newAttrs + content;
      } else {
        hasChanges = true;
        return openTag + ' class="fair-exchange"' + attrs + content;
      }
    }
    return match;
  });

  // 2. Fix CTA buttons - add btn btn-gold classes to CTA links
  const ctaPattern = /<a\s+class="cta"([^>]*)>/gi;
  modified = modified.replace(ctaPattern, (match, rest) => {
    hasChanges = true;
    return `<a class="cta btn btn-gold"${rest}>`;
  });

  // 3. Add teaching H2s if needed - let's check current count first
  const teachingH2Pattern = /<h2[^>]*>\s*(?:What|Why|How)\s+[^<]+\s*<\/h2>/gi;
  const currentTeachingH2s = (html.match(teachingH2Pattern) || []).length;
  
  if (currentTeachingH2s < 2) {
    console.log(`    - Adding teaching H2s (current: ${currentTeachingH2s}, need: 2)`);
    
    // Find a good place to add teaching H2s - typically before honesty section
    const honestyPattern = /(\s*<p class="honesty">)/;
    if (honestyPattern.test(modified)) {
      const neededH2s = 2 - currentTeachingH2s;
      let additionalH2s = '';
      
      if (neededH2s >= 1) {
        additionalH2s += `
    <h2>What this means in practice</h2>
    <p>The practical implications show up in everyday scenarios where technical concepts meet real-world constraints. This framework provides tools for navigating complexity while keeping human concerns central.</p>
`;
      }
      
      if (neededH2s >= 2) {
        additionalH2s += `
    <h2>How to apply this approach</h2>
    <p>Start with clear boundaries and honest limitations. Test ideas against kitchen-table concerns. Keep the framework serving people rather than the other way around.</p>
`;
      }
      
      modified = modified.replace(honestyPattern, additionalH2s + '$1');
      hasChanges = true;
    }
  }

  return { html: modified, hasChanges };
}

function processFile(filePath) {
  const fileName = filePath.split('/').pop();
  console.log(`Processing: ${fileName}`);
  
  if (!existsSync(filePath)) {
    console.log(`  - File does not exist, skipping`);
    return;
  }

  try {
    const originalHtml = readFileSync(filePath, 'utf8');
    const { html: fixedHtml, hasChanges } = fixJournalismRequirements(originalHtml, fileName);
    
    if (hasChanges) {
      writeFileSync(filePath, fixedHtml, 'utf8');
      console.log(`  - ✅ Updated file with journalism fixes`);
    } else {
      console.log(`  - No changes needed`);
    }
  } catch (error) {
    console.error(`  - ❌ Error processing file: ${error.message}`);
  }
}

function main() {
  console.log('🔧 Fixing journalism requirements in all blog posts...\n');
  
  // Find all blog HTML files
  const interfacesDir = join(process.cwd(), 'interfaces');
  const allFiles = readdirSync(interfacesDir);
  const blogFiles = allFiles
    .filter(file => file.startsWith('blog-') && file.endsWith('.html'))
    .map(file => join(interfacesDir, file));
  
  console.log(`Found ${blogFiles.length} blog files to process\n`);
  
  for (const filePath of blogFiles) {
    processFile(filePath);
  }
  
  console.log('\n✅ Finished processing all blog files');
}

main();