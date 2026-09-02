const fs = require('fs'); 
const path = require('path'); 
function walk(dir) { 
  let results = []; 
  const list = fs.readdirSync(dir); 
  list.forEach(file => { 
    file = path.join(dir, file); 
    const stat = fs.statSync(file); 
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file)); 
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts')) results.push(file); 
    } 
  }); 
  return results; 
} 
const files = walk('C:/Projs/aliver/src'); 
files.forEach(f => { 
  let content = fs.readFileSync(f, 'utf8'); 
  let modified = false; 
  if (content.includes('NEXT_PUBLIC_APP_URL')) { 
    content = content.replace(/src=\{\(process\.env\.NEXT_PUBLIC_APP_URL \|\| ''\) \+ '(\/[^']+)'\}/g, 'src=""'); 
    content = content.replace(/src=\{\(process\.env\.NEXT_PUBLIC_APP_URL \|\| ""\) \+ "(\/[^"]+)"\}/g, 'src=""'); 
    modified = true; 
  } 
  if (modified) { 
    fs.writeFileSync(f, content); 
    console.log('Fixed images in ' + f); 
  } 
});