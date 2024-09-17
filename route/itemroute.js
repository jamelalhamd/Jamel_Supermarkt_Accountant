const express = require('express');
const app = express();
const router = express.Router();









const itemViewControl = require('../controller/itemcontroller');  // Update the path to the new controller

// Route to view all items
router.get('/items', itemViewControl.itemViewControl);

// Route to search for items
router.post('/searchitems', itemViewControl.searchItemController);

// Route to view a specific item for editing
router.get('/edititem/:id', itemViewControl.editItem);
router.post('/updateitem/:id', itemViewControl.updateItem);

// Route to render delete item page and handle item deletion
router.get('/deleteitem/:id', itemViewControl.deleteItemPage);
router.post('/deleteitem/:id', itemViewControl.deleteItem);

// Route to render add item page and handle adding a new item
router.get('/additem', itemViewControl.addItemPage);
router.post('/additem', itemViewControl.addItem);

// Route to view details of a specific item
router.get('/viewitem/:id', itemViewControl.itemViewDetails);

module.exports = router;










