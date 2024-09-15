const express = require('express');
const app = express();
const router = express.Router();
const storecontroller = require("../controller/storecontrol");
const supplierController = require("../controller/supplercontroler");
const itemcontroller = require("../controller/itemcontroller");


router.get('/storeview', storecontroller.storeviewcontrol);

// Route for handling search functionality for stores
router.post('/searchstore', storecontroller.searchcontroller);
router.get('/editstore/:id',storecontroller.editStore);


router.post('/editstore/:id', storecontroller.updateStore);
router.post('/deletestore/:id', storecontroller.deleteStore);
router.post('/addstore', storecontroller.addStore);
router.get('/addstore', storecontroller.addStorepage);



router.get('/supplierview/:id', supplierController.supplierViewControl);
router.get('/supplierdash', supplierController.supplierdashcontrol);
router.post('/searchsupplier', supplierController.searchSupplierController);
router.get('/editsupplier/:id', supplierController.editSupplier);
router.post('/updatesupplier/:id', supplierController.updateSupplier);
router.post('/deletesupplier/:id', supplierController.deleteSupplier);
router.post('/addsupplier', supplierController.addSupplier);
router.get('/deletesupplier/:id', supplierController.deleteSupplie_get);
router.get('/addsupplier', supplierController.addSupplierPage);
module.exports = router;




