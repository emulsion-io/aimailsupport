const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const sourceDir = path.join(__dirname, '..', 'ai-mail-support');
const outputDir = path.join(__dirname, '..', 'dist');
const outputFile = path.join(outputDir, 'ai-mail-extended.xpi');

// Créer le dossier dist si nécessaire
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Créer le stream de sortie
const output = fs.createWriteStream(outputFile);
const archive = archiver('zip', {
    zlib: { level: 9 } // Compression maximale
});

// Écouter les événements
output.on('close', () => {
    console.log(`Extension packagée : ${outputFile} (${archive.pointer()} bytes)`);
});

archive.on('error', (err) => {
    throw err;
});

// Pipe archive data to the file
archive.pipe(output);

// Ajouter le contenu du dossier ai-mail-support (sans le dossier lui-même)
archive.directory(sourceDir, false);

// Finaliser l'archive
archive.finalize();