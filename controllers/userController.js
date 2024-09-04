
const db = require("../db/pool");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const passport = require("../config/passport")
console.log(passport)

function getIndexPage(req, res) {
    res.render("index");
}

function getSignUpForm(req, res) {
    res.render("sign-up", { errors: [], formData: {} });
}

async function signUpUser(req, res) {
    await body('username').isEmail().withMessage('Must be a valid email').run(req);
    await body('password').isLength({ min: 5 }).withMessage('Password must be at least 5 characters long').run(req);
    await body('confirm_password').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords do not match');
        }
        return true;
    }).run(req);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('sign-up', {
            errors: errors.array(),
            formData: req.body      
        });
    }
    const userData = req.body;
    const result = await prisma.user.findUnique({
            where: {
                email: userData.username, 
            },
    });

    if (result !== null) {
        return res.render('sign-up', {
            errors: [{ msg: 'Username already exists' }],
            formData: req.body       
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        await prisma.user.create({
            data: {
                first_name: userData.first_name,
                last_name: userData.last_name,
                email: userData.username,
                password: hashedPassword
            }
        });
        res.redirect("/log-in");
    } catch (err) {
        console.error(err);
    }
}

function getlogIn(req, res) {
    res.render("log-in", {errors: [], successMessage: "", formData: {}})
}

process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit();
});
process.on('SIGTERM', async () => {
    await prisma.$disconnect();
    process.exit();
});


module.exports = {
    getIndexPage,
    getSignUpForm,
    signUpUser,
    getlogIn,
}  