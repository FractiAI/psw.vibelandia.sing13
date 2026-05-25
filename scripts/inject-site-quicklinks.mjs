import fs from 'fs';
import path from 'path';

const skip = /questfest-bridge|turner-bison|bulletin-board|vibelandia-questfest|look-under-the-hood/;
const inject =
  '  <link rel="stylesheet" href="/interfaces/site-quicklinks.css" />\n' +
  '  <script src="/interfaces/site-quicklinks.js" defer></script>\n';

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p);
    else if (name.endsWith('.html') && !skip.test(p)) {
      let c = fs.readFileSync(p, 'utf8');
      if (!c.includes('site-quicklinks')) {
        c = c.replace('</body>', inject + '</body>');
        fs.writeFileSync(p, c);
        console.log('updated', p);
      }
    }
  }
}

walk('interfaces');
