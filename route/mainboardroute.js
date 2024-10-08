const express = require('express');
const app = express();
const router = express.Router();

const authcontroler = require("../controller/authcontroler");
const mainboardcontroller = require("../controller/mainboardcontroller");

router.get('/mainboard', authcontroler.checkAuthAndFetchUser,mainboardcontroller.mainboard);



module.exports = router;