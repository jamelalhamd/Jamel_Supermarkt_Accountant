const express = require('express');
const app = express();
const router = express.Router();
const rolecontrooler= require("../controller/middelware");
const authcontroler = require("../controller/authcontroler");
const dasboardcontroller = require("../controller/dashboardcontroller");

router.get('/getdash',authcontroler.checkAuthAndFetchUser, dasboardcontroller.getdash);
router.post('/showdashboard',authcontroler.checkAuthAndFetchUser, dasboardcontroller.showdashboard);




router.get('/showdashboard',authcontroler.checkAuthAndFetchUser,rolecontrooler.Chef,rolecontrooler.Sale, dasboardcontroller.showdashboard);
module.exports = router;