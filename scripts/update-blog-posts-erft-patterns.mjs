#!/usr/bin/env node

/**
 * Update the 25 most recent blog posts to match ERFT editorial patterns.
 * 
 * Tasks:
 * 1. Remove "Closing pier" H2s (fold content into body)
 * 2. Remove Nevada valley stock formulas
 * 3. Ensure teaching H2s (What/Why/How patterns) 
 * 4. Update registry excerpts to concrete scoreboards vs catalog bites
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// Get the 25 most recent blog posts
async function getRecentBlogPosts() {
  const { WHITEPAPER_REGISTRY } = await import('../lib/whitepaper-registry.mjs');
  const { QUESTFEST_BLOG_POSTS } = await import('../lib/questfest-blog-posts.mjs');
  
  return Object.entries(WHITEPAPER_REGISTRY)
    .filter(([id, meta]) => meta.published && meta.shipBlog !== false && QUESTFEST_BLOG_POSTS[id])
    .sort((a, b) => b[1].published.localeCompare(a[1].published) || a[0].localeCompare(b[0]))
    .slice(0, 25)
    .map(([id, meta]) => ({
      id,
      meta,
      post: QUESTFEST_BLOG_POSTS[id],
      filePath: join(process.cwd(), 'interfaces', QUESTFEST_BLOG_POSTS[id].file)
    }));
}

function updateBlogPostHtml(html) {
  let updated = html;
  
  // 1. Remove "Closing pier" H2s (keep the content, just remove the H2 tag)
  updated = updated.replace(/<h2[^>]*>\s*Closing pier\s*<\/h2>/gi, '');
  
  // 2. Remove Nevada valley stock formulas
  updated = updated.replace(/From Reno's holographic AI valley[,\s]*/gi, '');
  updated = updated.replace(/Nevada's holographic AI valley[,\s]*/gi, '');
  
  // 3. Clean up any remaining Nevada references in descriptive text
  updated = updated.replace(/From Reno's FractiAI shelf[,:]/gi, 'From FractiAI:');
  
  return updated;
}

function suggestTeachingH2s(html, postId) {
  const h2s = [...html.matchAll(/<h2[^>]*>(.*?)<\/h2>/gi)];
  const teachingH2s = h2s.filter(match => 
    /^(What|Why|How)\s/i.test(match[1].trim())
  );
  
  console.log(`\n${postId}:`);
  console.log(`  Current H2s: ${h2s.length}`);
  console.log(`  Teaching H2s: ${teachingH2s.length}/2 required`);
  
  if (teachingH2s.length < 2) {
    console.log(`  Needs ${2 - teachingH2s.length} more teaching H2s`);
    console.log(`  Current H2s: ${h2s.map(m => m[1].trim()).join(', ')}`);
  }
}

async function main() {
  const posts = await getRecentBlogPosts();
  
  console.log(`Updating ${posts.length} blog posts to ERFT patterns...\n`);
  
  let updated = 0;
  let needsManualH2Updates = [];
  
  for (const { id, filePath, post } of posts) {
    try {
      const original = readFileSync(filePath, 'utf8');
      const updated_html = updateBlogPostHtml(original);
      
      if (updated_html !== original) {
        writeFileSync(filePath, updated_html);
        console.log(`✓ Updated ${post.file}`);
        updated++;
      } else {
        console.log(`- No changes needed for ${post.file}`);
      }
      
      // Check H2 patterns
      suggestTeachingH2s(updated_html, id);
      
      const h2s = [...updated_html.matchAll(/<h2[^>]*>(.*?)<\/h2>/gi)];
      const teachingH2s = h2s.filter(match => 
        /^(What|Why|How)\s/i.test(match[1].trim())
      );
      
      if (teachingH2s.length < 2) {
        needsManualH2Updates.push({
          id,
          file: post.file,
          currentH2s: h2s.map(m => m[1].trim()),
          teachingCount: teachingH2s.length
        });
      }
      
    } catch (error) {
      console.error(`Error updating ${filePath}:`, error.message);
    }
  }
  
  console.log(`\n\nSummary:`);
  console.log(`- Updated ${updated} files`);
  console.log(`- ${needsManualH2Updates.length} files need manual H2 updates for teaching patterns`);
  
  if (needsManualH2Updates.length > 0) {
    console.log(`\nFiles needing H2 updates:`);
    for (const item of needsManualH2Updates) {
      console.log(`  ${item.file}: ${item.teachingCount}/2 teaching H2s`);
      console.log(`    Current: ${item.currentH2s.join(', ')}`);
    }
  }
}

main().catch(console.error);