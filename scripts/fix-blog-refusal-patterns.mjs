#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

const INTERFACES_DIR = join(process.cwd(), 'interfaces');

// Use the exact same regex as in the journalism voice smell check
const REFUSAL_H2_RE = 
  /<h2[^>]*>\s*(What (this|builders|guests|readers|you) .{0,40}(should )?not|What (it|this) (is|isn.?t)|What validates|Goldilocks squeeze|Honesty rail|Working the rhyme without|What .* refuse|Closing pier)\s*<\/h2>/gi;

function fixRefusalPatterns(html) {
  const originalLength = html.length;
  // Simply remove the H2 heading - the content that follows will naturally flow into the preceding section
  const modified = html.replace(REFUSAL_H2_RE, '');
  const hasChanges = modified.length !== originalLength;
  
  if (hasChanges) {
    console.log(`  - Removed refusal H2 heading(s)`);
  }

  return { html: modified, hasChanges };
}

function processFile(filePath) {
  console.log(`Processing: ${filePath}`);
  
  if (!existsSync(filePath)) {
    console.log(`  - File does not exist, skipping`);
    return;
  }

  try {
    const originalHtml = readFileSync(filePath, 'utf8');
    const { html: fixedHtml, hasChanges } = fixRefusalPatterns(originalHtml);
    
    if (hasChanges) {
      writeFileSync(filePath, fixedHtml, 'utf8');
      console.log(`  - ✅ Updated file with refusal pattern fixes`);
    } else {
      console.log(`  - No refusal patterns found`);
    }
  } catch (error) {
    console.error(`  - ❌ Error processing file: ${error.message}`);
  }
}

function main() {
  console.log('🔧 Fixing refusal patterns in all blog posts...\n');
  
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