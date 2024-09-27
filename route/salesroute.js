const express = require('express');
const app = express();
const router = express.Router();
const salesinvoice = require("../controller/invoicecontroller");
const authcontroler = require("../controller/authcontroler");


router.get("/salesinvoice",authcontroler.checkAuthAndFetchUser,salesinvoice.salesinvocepage);
router.get("/addsalesinvoice",authcontroler.checkAuthAndFetchUser,salesinvoice.addsalesinvocepage);
router.post("/searchIteminvoice",authcontroler.checkAuthAndFetchUser,salesinvoice.searchItemController);
router.post("/editvoiceitem", authcontroler.checkAuthAndFetchUser, salesinvoice.updateSalesInvoiceItem);
router.post("/deletevoiceitem", authcontroler.checkAuthAndFetchUser, salesinvoice.deleteSalesInvoiceItem);
router.post("/createthevoice", authcontroler.checkAuthAndFetchUser, salesinvoice.createthevoicecontroller);





router.get("/viewinvoicepage/:id", authcontroler.checkAuthAndFetchUser, salesinvoice.viewinvoicepagecontroller);
router.get("/editinvoicepage/:id", authcontroler.checkAuthAndFetchUser, salesinvoice.editinvoicepagecontroller);
router.get("/deleteinvoicepage/:id", authcontroler.checkAuthAndFetchUser, salesinvoice.deleteinvoicecontroller);


router.post("/deleteinvoice/:id", authcontroler.checkAuthAndFetchUser, salesinvoice.deleteinvoice);


module.exports = router;