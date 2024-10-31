const express = require('express');
const app = express();
const router = express.Router();
const storecontroller = require("../controller/storecontrol");
const supplierController = require("../controller/supplercontroler");

const authcontroler = require("../controller/authcontroler");
const rolecontrooler= require("../controller/middelware");
router.get('/storeview',authcontroler.checkAuthAndFetchUser, storecontroller.storeviewcontrol);

// Route for handling search functionality for stores
router.post('/searchstore',authcontroler.checkAuthAndFetchUser, storecontroller.searchcontroller);
router.get('/editstore/:id',authcontroler.checkAuthAndFetchUser,rolecontrooler. allrole ,storecontroller.editStore);


router.post('/editstore/:id',authcontroler.checkAuthAndFetchUser,rolecontrooler. allrole , storecontroller.updateStore);
router.post('/deletestore/:id',authcontroler.checkAuthAndFetchUser,rolecontrooler. allrole , storecontroller.deleteStore);
router.post('/addstore',authcontroler.checkAuthAndFetchUser,rolecontrooler. allrole , storecontroller.addStore);
router.get('/addstore', authcontroler.checkAuthAndFetchUser,rolecontrooler. allrole ,storecontroller.addStorepage);
router.post('/updatesupplier/:id',authcontroler.checkAuthAndFetchUser,rolecontrooler. allrole , supplierController.updateSupplier);
router.get('/deletesupplierpage/:id',authcontroler.checkAuthAndFetchUser,rolecontrooler. allrole , supplierController.deleteSupplie_get);

router.get('/supplierview/:id',authcontroler.checkAuthAndFetchUser, supplierController.supplierViewControl);
router.get('/supplierdash',authcontroler.checkAuthAndFetchUser,rolecontrooler. allrole ,rolecontrooler.Buyer, supplierController.supplierdashcontrol);
router.post('/searchsupplier',authcontroler.checkAuthAndFetchUser, supplierController.searchSupplierController);
router.get('/editsupplier/:id',authcontroler.checkAuthAndFetchUser, supplierController.editSupplier);

router.post('/deletesupplier/:id',authcontroler.checkAuthAndFetchUser, supplierController.deleteSupplier);
router.post('/addsupplier',authcontroler.checkAuthAndFetchUser, supplierController.addSupplier);

router.get('/addsupplier', authcontroler.checkAuthAndFetchUser,supplierController.addSupplierPage);


module.exports = router;




