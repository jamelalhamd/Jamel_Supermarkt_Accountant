const express = require('express');
const app = express();
const router = express.Router();

const authcontroler = require("../controller/authcontroler");
const rolecontrooler= require("../controller/middelware");






const itemViewControl = require('../controller/itemcontroller');  // Update the path to the new controller

// Route to view all items
router.get('/items',authcontroler.checkAuthAndFetchUser, itemViewControl.itemViewControl);

// Route to search for items
router.post('/searchitems',authcontroler.checkAuthAndFetchUser, itemViewControl.searchItemController);

// Route to view a specific item for editing
router.get('/edititem/:id',authcontroler.checkAuthAndFetchUser,rolecontrooler.Store,rolecontrooler.Buyer, itemViewControl.editItem);
router.post('/updateitem/:id',authcontroler.checkAuthAndFetchUser,rolecontrooler.Store,rolecontrooler.Buyer, itemViewControl.updateItem);

// Route to render delete item page and handle item deletion
router.post('/deleteitem/:id', authcontroler.checkAuthAndFetchUser,rolecontrooler.Store,rolecontrooler.Buyer,itemViewControl.deleteItem);
router.get('/deleteitempage/:id',authcontroler.checkAuthAndFetchUser,rolecontrooler.Store,rolecontrooler.Buyer, itemViewControl.deleteItemPage);
// Route to render add item page and handle adding a new item
router.get('/additem',authcontroler.checkAuthAndFetchUser,rolecontrooler.Store,rolecontrooler.Buyer, itemViewControl.addItemPage);
router.post('/additem', authcontroler.checkAuthAndFetchUser,rolecontrooler.Store,rolecontrooler.Buyer,itemViewControl.addItem);

// Route to view details of a specific item
router.get('/viewitem/:id',authcontroler.checkAuthAndFetchUser, itemViewControl.itemViewDetails);

module.exports = router;










