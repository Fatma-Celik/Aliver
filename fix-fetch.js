const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

walkDir('C:/Projs/aliver/src', filePath => {
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // fetch('/api/...
    if (content.includes(`fetch('/api/`)) {
      content = content.replace(/fetch\('(\/api\/[^']+)'/g, `fetch((process.env.NEXT_PUBLIC_APP_URL || '') + '$1'`);
      changed = true;
    }
    
    // fetch(`/api/...
    if (content.includes('fetch(`/api/')) {
      content = content.replace(/fetch\(\`(\/api\/[^\`]+)\`/g, 'fetch(`${process.env.NEXT_PUBLIC_APP_URL || \'\'}$1`');
      changed = true;
    }

    // auth-screen.tsx special case: fetch(endpoint
    if (filePath.includes('auth-screen.tsx') && content.includes(`fetch(endpoint`)) {
      content = content.replace(/fetch\(endpoint/g, `fetch((process.env.NEXT_PUBLIC_APP_URL || '') + endpoint`);
      changed = true;
    }
    
    // Replace <Image src="/aliver-logo-light.png"
    if (content.includes('src="/aliver-logo-light.png"')) {
      content = content.replace(/src="\/aliver-logo-light\.png"/g, 'src={(process.env.NEXT_PUBLIC_APP_URL || \'\') + \'/aliver-logo-light.png\'}');
      changed = true;
    }

    if (content.includes('src="/aliver-logo-dark.png"')) {
      content = content.replace(/src="\/aliver-logo-dark\.png"/g, 'src={(process.env.NEXT_PUBLIC_APP_URL || \'\') + \'/aliver-logo-dark.png\'}');
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated', filePath);
    }
  }
});