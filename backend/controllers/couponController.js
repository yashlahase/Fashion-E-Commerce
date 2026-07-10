const Coupon = require('../models/Coupon');

// @desc    Validate a coupon code
// @route   POST /api/coupons/validate
// @access  Private
const validateCoupon = async (req, res, next) => {
  try {
    const { code } = req.body;

    if (!code) {
      res.status(400);
      return next(new Error('Please provide coupon code'));
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    if (coupon && coupon.expiryDate > new Date()) {
      res.json({
        valid: true,
        code: coupon.code,
        discountType: coupon.discountType,
        discountAmount: coupon.discountAmount,
      });
    } else {
      res.status(400).json({
        valid: false,
        message: 'Invalid or expired coupon code',
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get all coupons (Admin only)
// @route   GET /api/coupons
// @access  Private/Admin
const getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find({});
    res.json(coupons);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a coupon (Admin only)
// @route   POST /api/coupons
// @access  Private/Admin
const createCoupon = async (req, res, next) => {
  try {
    const { code, discountType, discountAmount, expiryDate } = req.body;

    if (!code || !discountType || discountAmount === undefined || !expiryDate) {
      res.status(400);
      return next(new Error('Please provide code, type, amount, and expiry date'));
    }

    const couponExists = await Coupon.findOne({ code: code.toUpperCase() });
    if (couponExists) {
      res.status(400);
      return next(new Error('Coupon code already exists'));
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType,
      discountAmount,
      expiryDate: new Date(expiryDate),
    });

    res.status(201).json(coupon);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a coupon (Admin only)
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (coupon) {
      await Coupon.deleteOne({ _id: req.params.id });
      res.json({ message: 'Coupon removed successfully' });
    } else {
      res.status(404);
      return next(new Error('Coupon not found'));
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  validateCoupon,
  getCoupons,
  createCoupon,
  deleteCoupon,
};
