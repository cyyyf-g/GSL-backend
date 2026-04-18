const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(fullPath));
        } else if (file.endsWith('.js')) {
            results.push(fullPath);
        }
    });
    return results;
}

const files = walk(path.join(__dirname, 'src'));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;
    
    if (content.includes('\\`')) {
        content = content.replace(/\\`/g, '`');
        modified = true;
    }
    
    if (content.includes('\\${')) {
        content = content.replace(/\\\${/g, '${');
        modified = true;
    }
    
    if (modified) {
        fs.writeFileSync(file, content);
        console.log('Fixed:', file);
    }
});
