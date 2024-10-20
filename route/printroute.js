const express = require('express');
const app = express();
const router = express.Router();
const purchesesinvoice = require("../controller/purchesescontroller");
const authcontroler = require("../controller/authcontroler");
const rolecontrooler= require("../controller/middelware");
const salesinvoice = require("../controller/invoicecontroller");
const printcontroller= require("../controller/printcontrol");


router.get('/pdfinvoice/:id',authcontroler.checkAuthAndFetchUser,printcontroller.topdf)















module.exports = router;
