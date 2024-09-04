const express = require("express")
const router = express.Router();
const userController = require("../controllers/userController");
const passport = require("../config/passport");


router.get("/", userController.getIndexPage);

router.get("/sign-up", userController.getSignUpForm);
router.post("/sign-up", userController.signUpUser);

router.get("/log-in", userController.getlogIn);
router.post(
    "/log-in",
    (req, res, next) => {
        console.log(passport)
        passport.authenticate("local", (err, user, info) => {
            if (err) {
                return next(err); 
            }
            if (!user) {
                return res.render("log-in", {
                    message: info.message, 
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

module.exports = router;
