const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Please add a coupon code'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage',
    },
    discountAmount: {
      type: Number,
      required: [true, 'Please add a discount amount'],
    },
    expiryDate: {
      type: Date,
      required: [true, 'Please add an expiry date'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Method to validate coupon
couponSchema.methods.isValid = function () {
  return this.isActive && this.expiryDate > new Date();
};

module.exports = mongoose.model('Coupon', couponSchema);
