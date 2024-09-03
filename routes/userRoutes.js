const express = require("express")
const router = express.Router();
const userController = require("../controllers/userController");

router.get("/", userController.getIndexPage);

router.get("/sign-up", userController.getSignUpForm);
router.post("/sign-up", userController.signUpUser);

module.exports = router;
