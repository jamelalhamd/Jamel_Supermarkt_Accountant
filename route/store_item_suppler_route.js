const express = require('express');
const app = express();
const router = express.Router();
const storecontroller = require("../controller/storecontrol");
const supplercontrooler = require("../controller/supplercontroler");
const itemcontroller = require("../controller/itemcontroller");


router.get('/storeview', storecontroller.storeviewcontrol);

// Route for handling search functionality for stores
router.post('/searchstore', storecontroller.searchcontroller);
router.get('/editstore/:id',storecontroller.editStore);


router.post('/editstore/:id', storecontroller.updateStore);
router.post('/deletestore/:id', storecontroller.deleteStore);
router.post('/addstore', storecontroller.addStore);
router.get('/addstore', storecontroller.addStorepage);

module.exports = router;




