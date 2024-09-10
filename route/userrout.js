const express = require('express');
const app = express();
const router = express.Router();
const authcontroler = require("../controller/authcontroler");


module.exports = router;

router.get("/login",authcontroler.logincontroler);
router.get("/signup",authcontroler.signupcontroler);
router.post("/loginpost", authcontroler.loginpostcontroller);