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


router.get("/viewpurchesinvoice/:id",authcontroler.checkAuthAndFetchUser,purchesesinvoice.viewpurchesinvoice );
router.get("/deletepurchesinvoice/:id",authcontroler.checkAuthAndFetchUser,purchesesinvoice.deletepurchesinvoice );
router.get("/editpurchesinvoice/:id",authcontroler.checkAuthAndFetchUser,purchesesinvoice.editpurchesinvoice );


router.post("/deletepurchesinvoiceedititem",authcontroler.checkAuthAndFetchUser,purchesesinvoice.deletePurchasesitemedit);
//================================================
router.post("/updatepurchesedititem",authcontroler.checkAuthAndFetchUser,purchesesinvoice.updatepurchesitemedit );


router.post("/addPourchesItemforeditController",authcontroler.checkAuthAndFetchUser,purchesesinvoice.addPourchesItemforeditController);
router.post("/updatethesupllierpurcheses/:id",authcontroler.checkAuthAndFetchUser,purchesesinvoice.updateSupplierPurchases);

module.exports = router;

//updatethesupllier