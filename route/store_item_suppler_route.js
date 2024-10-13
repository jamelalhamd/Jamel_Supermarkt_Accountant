const express = require('express');
const app = express();
const router = express.Router();
const storecontroller = require("../controller/storecontrol");
const supplierController = require("../controller/supplercontroler");

const authcontroler = require("../controller/authcontroler");
const rolecontrooler= require("../controller/middelware");
router.get('/storeview',authcontroler.checkAuthAndFetchUser,rolecontrooler.Chef, storecontroller.storeviewcontrol);

// Route for handling search functionality for stores
router.post('/searchstore',authcontroler.checkAuthAndFetchUser, storecontroller.searchcontroller);
router.get('/editstore/:id',authcontroler.checkAuthAndFetchUser,storecontroller.editStore);


router.post('/editstore/:id',authcontroler.checkAuthAndFetchUser, storecontroller.updateStore);
router.post('/deletestore/:id',authcontroler.checkAuthAndFetchUser, storecontroller.deleteStore);
router.post('/addstore',authcontroler.checkAuthAndFetchUser, storecontroller.addStore);
router.get('/addstore', authcontroler.checkAuthAndFetchUser,storecontroller.addStorepage);
router.post('/updatesupplier/:id',authcontroler.checkAuthAndFetchUser, supplierController.updateSupplier);
router.get('/deletesupplierpage/:id',authcontroler.checkAuthAndFetchUser, supplierController.deleteSupplie_get);

router.get('/supplierview/:id',authcontroler.checkAuthAndFetchUser, supplierController.supplierViewControl);
router.get('/supplierdash',authcontroler.checkAuthAndFetchUser, supplierController.supplierdashcontrol);
router.post('/searchsupplier',authcontroler.checkAuthAndFetchUser, supplierController.searchSupplierController);
router.get('/editsupplier/:id',authcontroler.checkAuthAndFetchUser, supplierController.editSupplier);

router.post('/deletesupplier/:id',authcontroler.checkAuthAndFetchUser, supplierController.deleteSupplier);
router.post('/addsupplier',authcontroler.checkAuthAndFetchUser, supplierController.addSupplier);

router.get('/addsupplier', authcontroler.checkAuthAndFetchUser,supplierController.addSupplierPage);


module.exports = router;




