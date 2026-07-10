const express = require('express');
const {
  validateCoupon,
  getCoupons,
  createCoupon,
  deleteCoupon,
} = require('../controllers/couponController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/validate', protect, validateCoupon);
router.route('/')
  .get(protect, admin, getCoupons)
  .post(protect, admin, createCoupon);
router.delete('/:id', protect, admin, deleteCoupon);

module.exports = router;
