const express = require('express');
const router = express.Router();
const promotionViewControl = require('../controller/promotioncontroller');

// Route to view all promotions
router.get('/promotions', promotionViewControl.promotionViewControl);

// Route to view a specific promotion for editing

router.post('/searchpromotion', promotionViewControl.searchPromotionController);
router.get('/editpromotion/:id', promotionViewControl.editPromotion);
router.post('/updatepromotion/:id', promotionViewControl.updatePromotion);
router.get('/deletepromotion/:id', promotionViewControl.deletePromotionpage)
router.post('/deletepromotion/:id', promotionViewControl.deletePromotion);
router.get('/addPromotion', promotionViewControl.addPromotionpage);
router.post('/addPromotion', promotionViewControl.addPromotion);
router.get('/viewPromotion/:id', promotionViewControl.promotionViewDetails);
module.exports = router;
