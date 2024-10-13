const express = require('express');
const app = express();
const router = express.Router();

const authcontroler = require("../controller/authcontroler");
const stockcontroler = require("../controller/stockcontroller");
const rolecontrooler= require("../controller/middelware");


router.get('/nostock',authcontroler.checkAuthAndFetchUser,rolecontrooler.Store,rolecontrooler.Buyer,rolecontrooler.Sale,stockcontroler.nostock  );
router.get('/lowstock',authcontroler.checkAuthAndFetchUser,stockcontroler.lowstock  );
router.get('/back',authcontroler.checkAuthAndFetchUser,stockcontroler.back );
router.post('/searchnostock',authcontroler.checkAuthAndFetchUser,stockcontroler.searchItemController );

router.get('/viewnostockitem/:id',authcontroler.checkAuthAndFetchUser,stockcontroler.itemViewDetails );
router.post('/deletenostockitem/:id',authcontroler.checkAuthAndFetchUser,stockcontroler.deleteItem);
router.get('/deletenostockitempage/:id',authcontroler.checkAuthAndFetchUser,stockcontroler.deleteItemPage );
router.get('/expirdate',authcontroler.checkAuthAndFetchUser,stockcontroler.Expiredate );
router.get('/experdatenear',authcontroler.checkAuthAndFetchUser,stockcontroler.Expiredatenearly );

module.exports = router;