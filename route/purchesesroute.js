const express = require('express');
const app = express();
const router = express.Router();
const purchesesinvoice = require("../controller/purchesescontroller");
const authcontroler = require("../controller/authcontroler");




//================================================
router.get("/purchesesinvoce",authcontroler.checkAuthAndFetchUser,purchesesinvoice.purchaseInvoicePage);
router.get("/addpurchaseinvoce",authcontroler.checkAuthAndFetchUser,purchesesinvoice.addpurchaseinvocepage);
router.post("/addpurchesitem",authcontroler.checkAuthAndFetchUser,purchesesinvoice.addourchesItemController);
router.post("/deletepurchesinvoiceitem",authcontroler.checkAuthAndFetchUser,purchesesinvoice.deletePurchasesitem);
//================================================
router.post("/updatepurchesitem",authcontroler.checkAuthAndFetchUser,purchesesinvoice.updatepurchesitem );
router.post("/createpurchesinvoice",authcontroler.checkAuthAndFetchUser,purchesesinvoice.createthevoicepurchesecontroller );


module.exports = router;