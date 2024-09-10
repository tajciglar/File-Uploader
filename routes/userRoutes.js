const express = require("express")
const router = express.Router();
const userController = require("../controllers/userController");
const fileController = require("../controllers/fileController")
const passport = require("../config/passport");
const { isAuthenticated } = require("../middleware/isAuthenticated");
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })


router.get("/", isAuthenticated, userController.getIndexPage);
router.post("/", isAuthenticated, upload.single('uploaded_file'), userController.getIndexPage);

router.get("/sign-up", userController.getSignUpForm);
router.post("/sign-up", userController.signUpUser);

router.get("/log-in", userController.getlogIn);
router.post(
    "/log-in",
    (req, res, next) => {
        passport.authenticate("local", (err, user, info) => {
            if (err) {
                return next(err); 
            }
            if (!user) {
                return res.render("log-in", {
                    errors: info.message, 
                    formData: req.body,    
                    successMessage: ""     
                });
            }
            req.logIn(user, (err) => {
                if (err) {
                    return next(err);
                }
                return res.redirect("/");
            });
        })(req, res, next);
    }
);

router.get("/log-out", (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect("/");
    });
});

router.post("/create-folder", fileController.createFolder);

router.get("/folders/:folder_name", isAuthenticated, fileController.getFolder)

router.post("/upload-file",isAuthenticated, upload.single('uploaded_file'), fileController.uploadFile)
module.exports = router;
