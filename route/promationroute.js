const express = require('express');
const router = express.Router();
const promotionViewControl = require('../controller/promotioncontroller');

// Route to view all promotions
router.get('/promotions', promotionViewControl.promotionViewControl);

// Route to view a specific promotion for editing

router.post('/searchpromotion', promotionViewControl.searchPromotionController);
// Route to update a specific promotion

module.exports = router;
