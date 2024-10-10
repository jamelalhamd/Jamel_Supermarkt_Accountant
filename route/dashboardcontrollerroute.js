const express = require('express');
const app = express();
const router = express.Router();

const authcontroler = require("../controller/authcontroler");
const dasboardcontroller = require("../controller/dashboardcontroller");

router.get('/getdash',authcontroler.checkAuthAndFetchUser, dasboardcontroller.getdash);
router.post('/getdashboard',authcontroler.checkAuthAndFetchUser, dasboardcontroller.getdashboard);
module.exports = router;