const express = require('express');
const app = express();
const router = express.Router();

const authcontroler = require("../controller/authcontroler");
const dasboardcontroller = require("../controller/dashboardcontroller");

router.get('/getdash',authcontroler.checkAuthAndFetchUser, dasboardcontroller.getdash);
router.post('/showdashboard',authcontroler.checkAuthAndFetchUser, dasboardcontroller.showdashboard);
router.get('/showdashboard',authcontroler.checkAuthAndFetchUser, dasboardcontroller.showdashboard);
module.exports = router;