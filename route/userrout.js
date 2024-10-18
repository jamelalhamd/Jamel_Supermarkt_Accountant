const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const router = express.Router();
const authcontroler = require("../controller/authcontroler");
//================================================

const itemViewControl = require('../controller/itemcontroller'); 





router.get("/login",authcontroler.logincontroler);
router.get("/signup",authcontroler.signupcontroler);
router.get("/signout",authcontroler.signoutcontroler);
router.post("/loginpost", authcontroler.loginpostcontroller);

router.get("/reset",authcontroler.restpassword);
router.post("/reset",authcontroler.forgotPasswordController);
router.get("/changepassword",authcontroler.checkAuthAndFetchUser,authcontroler.changepassword);
router.post("/changepassword",authcontroler.checkAuthAndFetchUser,authcontroler.changepasswordpost);
module.exports = router;