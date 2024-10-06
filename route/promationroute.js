const express = require('express');
const router = express.Router();
const promotionViewControl = require('../controller/promotioncontroller');
const authcontroler = require("../controller/authcontroler");
// Route to view all promotions
router.get('/promotions',authcontroler.checkAuthAndFetchUser, promotionViewControl.promotionViewControl);

// Route to view a specific promotion for editing

router.post('/searchpromotion',authcontroler.checkAuthAndFetchUser, promotionViewControl.searchPromotionController);
router.get('/editpromotion/:id',authcontroler.checkAuthAndFetchUser, promotionViewControl.editPromotion);
router.post('/updatepromotion/:id',authcontroler.checkAuthAndFetchUser, promotionViewControl.updatePromotion);
router.get('/deletepromotion/:id',authcontroler.checkAuthAndFetchUser, promotionViewControl.deletePromotionpage)
router.post('/deletepromotion/:id',authcontroler.checkAuthAndFetchUser, promotionViewControl.deletePromotion);
router.get('/addPromotion', authcontroler.checkAuthAndFetchUser,promotionViewControl.addPromotionpage);
router.post('/addPromotion',authcontroler.checkAuthAndFetchUser, promotionViewControl.addPromotion);
router.get('/viewPromotion/:id',authcontroler.checkAuthAndFetchUser, promotionViewControl.promotionViewDetails);
module.exports = router;
