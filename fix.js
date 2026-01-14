const fs = require('fs');
const path = require('path');

const targetDir = __dirname;

function cleanNuke(filePath) {
    if (filePath.includes('node_modules') || filePath.includes('.git')) return;

    let lines = fs.readFileSync(filePath, 'utf-8').split(/\r?\n/);
    let newLines = [];
    let skip = false;

    for (let line of lines) {
        // Jika ketemu tanda awal conflict, kita ambil versi lokal (HEAD)
        if (line.startsWith('<<<<<<<')) {
            skip = false; // Pastikan baris setelah ini tetap diambil
            continue; 
        }
        // Jika ketemu pembatas, kita mulai skip sampai tanda akhir
        if (line.startsWith('=======')) {
            skip = true;
            continue;
        }
        // Jika ketemu tanda akhir, berhenti skip
        if (line.startsWith('>>>>>>>')) {
            skip = false;
            continue;
        }

        if (!skip) {
            newLines.push(line);
        }
    }

    const cleaned = newLines.join('\n');
    fs.writeFileSync(filePath, cleaned, 'utf-8');
    console.log(`✅ FIXED TOTAL: ${filePath}`);
}

function walk(dir) {
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (file.endsWith('.js') || file.endsWith('.json')) {
            cleanNuke(fullPath);
        }
    });
}

console.log("🚀 Memulai pembersihan total (Nuke Mode)...");
walk(targetDir);
console.log("✨ Selesai! Sekarang semua file seharusnya sudah normal.");