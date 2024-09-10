const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient()
const cloudinary = require("../config/cloudinary")

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
            folder: folder,
            files: folder.files.map(file => file.file_name)
        });
    } catch (error) {
        console.error('Error retrieving folder and files:', error);
        res.status(500).send('Server Error');
    }
}


async function uploadFile(req, res) {
    const file = req.file;
    const folderId = parseInt(req.body.folderId);
    const userId = req.user.id;
    const folderName = req.body.folderName;

    if (!file || !folderId || !userId) {
        return res.status(400).json({ error: "Missing required data" });
    }

    try {
        const result = await cloudinary.uploader.upload(file.path, {
            folder: `my_folder/${folderName}`, 
            resource_type: 'auto',
            public_id: file.originalname,
        });

        await prisma.file.create({
            data: {
                file_name: file.originalname,
                folderId: folderId,
                created_by: userId,
                cloudinary_url: result.secure_url, 
            }
        });

        // Redirect to the folder view
        res.redirect(`/folders/${folderName}`);
    } catch (error) {
        console.error("Error uploading file:", error);
        res.status(500).json({ error: "Server Error" });
    }
}


module.exports = {
    createFolder,
    uploadFile,
    getFolder
}