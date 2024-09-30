const express = require('express');
const app = express();
const router = express.Router();
const purchesesinvoice = require("../controller/purchesescontroller");
const authcontroler = require("../controller/authcontroler");




//================================================
router.get("/purchesesinvoce",authcontroler.checkAuthAndFetchUser,purchesesinvoice.purchaseInvoicePage);
router.get("/addpurchaseinvoce",authcontroler.checkAuthAndFetchUser,purchesesinvoice.addpurchaseinvocepage);
router.post("/addpurchesitem",authcontroler.checkAuthAndFetchUser,purchesesinvoice.addourchesItemController);

//================================================




module.exports = router;