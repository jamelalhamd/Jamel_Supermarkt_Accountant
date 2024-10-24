const express = require('express');
const app = express();
const router = express.Router();
const purchesesinvoice = require("../controller/purchesescontroller");
const authcontroler = require("../controller/authcontroler");
const rolecontrooler= require("../controller/middelware");
const salesinvoice = require("../controller/invoicecontroller");
const printcontroller= require("../controller/printcontrol");


router.get('/pdfinvoice/:id',authcontroler.checkAuthAndFetchUser,printcontroller.topdf);
router.get('/salespdfinvoice/:id',authcontroler.checkAuthAndFetchUser,printcontroller.salestopdf);
router.get('/salespdfinvoiceprint/:id',authcontroler.checkAuthAndFetchUser,printcontroller.salestopdfprint); 
router.get('/pdfinvoiceprint/:id',authcontroler.checkAuthAndFetchUser,printcontroller.topdfprint);













module.exports = router;
