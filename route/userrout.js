const express = require('express');
const app = express();
const router = express.Router();
const authcontroler = require("../controller/authcontroler");
//================================================







router.get("/login",authcontroler.logincontroler);
router.get("/signup",authcontroler.signupcontroler);
router.get("/signout",authcontroler.signoutcontroler);
router.post("/loginpost", authcontroler.loginpostcontroller);
module.exports = router;