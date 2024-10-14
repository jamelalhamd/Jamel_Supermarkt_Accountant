const express = require('express');
const router = express.Router();
const promotionViewControl = require('../controller/promotioncontroller');
const authcontroler = require("../controller/authcontroler");
// Route to view all promotions
router.get('/promotions',authcontroler.checkAuthAndFetchUser, promotionViewControl.promotionViewControl);
const rolecontrooler= require("../controller/middelware");
// Route to view a specific promotion for editing

router.post('/searchpromotion',authcontroler.checkAuthAndFetchUser, promotionViewControl.searchPromotionController);
router.get('/editpromotion/:id',authcontroler.checkAuthAndFetchUser,rolecontrooler.Sale, promotionViewControl.editPromotion);
router.post('/updatepromotion/:id',authcontroler.checkAuthAndFetchUser,rolecontrooler.Sale, promotionViewControl.updatePromotion);
router.get('/deletepromotion/:id',authcontroler.checkAuthAndFetchUser,rolecontrooler.Sale, promotionViewControl.deletePromotionpage)
router.post('/deletepromotion/:id',authcontroler.checkAuthAndFetchUser,rolecontrooler.Sale, promotionViewControl.deletePromotion);
router.get('/addPromotion', authcontroler.checkAuthAndFetchUser,rolecontrooler.Sale,promotionViewControl.addPromotionpage);
router.post('/addPromotion',authcontroler.checkAuthAndFetchUser, promotionViewControl.addPromotion);
router.get('/viewPromotion/:id',authcontroler.checkAuthAndFetchUser, promotionViewControl.promotionViewDetails);
module.exports = router;
