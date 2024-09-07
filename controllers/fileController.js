const fs = require('fs');
const path = require('path');


function createFolder(req, res) {
    const folderName = req.body.folderName;
    const folderPath = path.join(__dirname, '../uploads', folderName);

    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
        res.redirect('/');
    } else {
        res.status(400).send('Folder already exists');
    }
}

function uploadFile(req, res) {
    const folderName = req.body.folder || 'default';
    const folderPath = path.join(__dirname, '../uploads', folderName);
    
    if (!fs.existsSync(folderPath)) {
        return res.status(400).send('Folder does not exist');
    }

    const file = req.file;
    const targetPath = path.join(folderPath, file.originalname);

    fs.rename(file.path, targetPath, (err) => {
        if (err) return res.status(500).send('Error uploading file');
        res.redirect('/');
    });
}

module.exports = {
    createFolder,
    uploadFile
}