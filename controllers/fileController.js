const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient()

async function createFolder(req, res) {
    const folderName = req.body.folderName;
    const userId = req.user.id; 

    try {
        const result = await prisma.folder.findUnique({
            where: {
                folder_name: folderName,
            }
        });

        if (result !== null) {
            const user = req.user.first_name + " " + req.user.last_name;
            const folders = await prisma.folder.findMany();  
            
            return res.render('index', {
                loggedIn: req.isAuthenticated(),
                user,
                folders,
                errors: "Folder already exists"
            });
        }

        await prisma.folder.create({
            data: {
                folder_name: folderName,  
                created_by: userId,
            }
        });

        const folders = await prisma.folder.findMany();

        res.render('index', {
            loggedIn: req.isAuthenticated(),
            user: req.user.first_name + " " + req.user.last_name,
            folders,
            errors: ""  
        });

    } catch (error) {
        console.error("Error creating folder:", error);
        res.status(500).send('Server Error');
    }
}


async function getFolder(req, res) {
    const folderName = req.params.folder_name;

    try {
        const folder = await prisma.folder.findUnique({
            where: {
                folder_name: folderName
            },
            include: {
                files: true 
            }
        });

        if (!folder) {
            return res.status(404).send('Folder not found');
        }
        res.render("folder", {
            folder_name: folder.folder_name,
            files: folder.files  
        });
    } catch (error) {
        console.error('Error retrieving folder and files:', error);
        res.status(500).send('Server Error');
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
    uploadFile,
    getFolder
}