const express = require('express');
const app = express();
const router = express.Router();

const authcontroler = require("../controller/authcontroler");
const mainboardcontroller = require("../controller/costcontroller");
const rolecontrooler= require("../controller/middelware");

router.get('/mainboard', authcontroler.checkAuthAndFetchUser,rolecontrooler.Accountant,mainboardcontroller.mainboard);
router.get('/viewcost/:id', authcontroler.checkAuthAndFetchUser,mainboardcontroller.viewcost);
router.get('/editcost/:id', authcontroler.checkAuthAndFetchUser,mainboardcontroller.editcost);
router.get('/addcostpage', authcontroler.checkAuthAndFetchUser,mainboardcontroller.addcostpage);
router.post('/addcost', authcontroler.checkAuthAndFetchUser,mainboardcontroller.addcost); 
router.post('/deletecost/:id', authcontroler.checkAuthAndFetchUser,mainboardcontroller.deletecost);
router.post('/editthecost/:id', authcontroler.checkAuthAndFetchUser,mainboardcontroller.editthecost);
router.post('/searchcost', authcontroler.checkAuthAndFetchUser,mainboardcontroller.searchcost);

module.exports = router;