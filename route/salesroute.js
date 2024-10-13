const express = require('express');
const app = express();
const router = express.Router();
const salesinvoice = require("../controller/invoicecontroller");
const authcontroler = require("../controller/authcontroler");
const rolecontrooler= require("../controller/middelware");

router.get("/salesinvoice",authcontroler.checkAuthAndFetchUser,rolecontrooler.Casher,rolecontrooler.Sale,salesinvoice.salesinvocepage);
router.get("/addsalesinvoice",authcontroler.checkAuthAndFetchUser,salesinvoice.addsalesinvocepage);
router.post("/searchIteminvoice",authcontroler.checkAuthAndFetchUser,salesinvoice.searchItemController);
router.post("/editvoiceitem", authcontroler.checkAuthAndFetchUser, salesinvoice.updateSalesInvoiceItem);
router.post("/deletevoiceitem", authcontroler.checkAuthAndFetchUser, salesinvoice.deleteSalesInvoiceItem);
router.post("/createthevoice", authcontroler.checkAuthAndFetchUser, salesinvoice.createthevoicecontroller);





router.get("/viewinvoicepage/:id", authcontroler.checkAuthAndFetchUser, salesinvoice.viewinvoicepagecontroller);
router.get("/editinvoicepage/:id", authcontroler.checkAuthAndFetchUser, salesinvoice.editinvoicepage);
router.get("/deleteinvoicepage/:id", authcontroler.checkAuthAndFetchUser, salesinvoice.deleteinvoicecontroller);

router.post("/deleteinvoice/:id", authcontroler.checkAuthAndFetchUser, salesinvoice.deleteinvoice);

router.post("/deleteeditepage/:id", authcontroler.checkAuthAndFetchUser, salesinvoice.deleteedite);
router.post("/editeditepage/:id", authcontroler.checkAuthAndFetchUser, salesinvoice.editedite);
router.post("/addeditepage/:id", authcontroler.checkAuthAndFetchUser, salesinvoice.addedite);

router.post("/addeditename/:id", authcontroler.checkAuthAndFetchUser, salesinvoice.addeditename);





router.get("/pdfsalesinvoice/:id", authcontroler.checkAuthAndFetchUser, salesinvoice.pdfsalesinvoic);

















module.exports = router;