const express = require('express');
const app = express();
const router = express.Router();
const salesinvoice = require("../controller/invoicecontroller");
const authcontroler = require("../controller/authcontroler");


router.get("/salesinvoice",authcontroler.checkAuthAndFetchUser,salesinvoice.salesinvocepage);
router.get("/addsalesinvoice",authcontroler.checkAuthAndFetchUser,salesinvoice.addsalesinvocepage);
router.post("/searchIteminvoice",authcontroler.checkAuthAndFetchUser,salesinvoice.searchItemController);
router.post("/editvoiceitem", authcontroler.checkAuthAndFetchUser, salesinvoice.updateSalesInvoiceItem);



module.exports = router;