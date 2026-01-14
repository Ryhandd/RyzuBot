const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'database/commands');

function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Regex untuk mencari blok <<<<<<< HEAD sampai >>>>>>> [hash]
    // Kita ambil bagian di antara HEAD dan =======
    const conflictRegex = /<<<<<<< HEAD\n([\s\S]*?)\n=======\n[\s\S]*?>>>>>>> .+/g;
    
    if (conflictRegex.test(content)) {
        const cleanedContent = content.replace(conflictRegex, '$1');
        fs.writeFileSync(filePath, cleanedContent, 'utf-8');
        console.log(`✅ Fixed: ${path.basename(filePath)}`);
    }
}

function walkDir(dir) {
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (file.endsWith('.js')) {
            fixFile(fullPath);
        }
    });
}

console.log("⏳ Memulai pembersihan file conflict...");
walkDir(targetDir);
console.log("✨ Selesai! Silakan cek file kamu.");