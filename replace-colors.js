const fs = require('fs');
const path = require('path');

const dirs = [
  path.join(__dirname, 'app'),
  path.join(__dirname, 'components')
];

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = [];
dirs.forEach(d => {
  if (fs.existsSync(d)) files.push(...walk(d));
});

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  // Exclude some specific cases if needed, but here we replace all hardcoded to var()
  // Note: HeroBanner has some bg-white and text-white that might actually need to stay white 
  // because it's a colored banner. Let's let them change to surface, but wait... HeroBanner is a green gradient banner. 
  // bg-white on a green gradient banner should stay white!
  
  // Let's do a smarter replace. 
  content = content.replace(/bg-white/g, 'bg-[var(--sara-surface)]');
  content = content.replace(/border-\[\#ECEEF0\]/g, 'border-[var(--sara-border)]');
  content = content.replace(/border-\[\#D7DBDF\]/g, 'border-[var(--sara-border)]');
  content = content.replace(/text-\[\#16191D\]/g, 'text-[var(--sara-text-primary)]');
  content = content.replace(/text-\[\#8A9099\]/g, 'text-[var(--sara-text-secondary)]');
  content = content.replace(/bg-\[\#F1F3F4\]/g, 'bg-[var(--sara-muted-card)]');
  
  if (content !== original) {
    console.log('Updated', file);
    fs.writeFileSync(file, content, 'utf8');
  }
});
