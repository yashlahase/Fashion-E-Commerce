const User = require('../models/User');

// @desc    Get user wishlist items
// @route   GET /api/wishlist
// @access  Private
const getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }
    res.json(user.wishlist);
  } catch (error) {
    next(error);
  }
};

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private
const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      res.status(400);
      return next(new Error('Please provide a product ID'));
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    // Check if already in wishlist
    if (!user.wishlist.includes(productId)) {
      user.wishlist.push(productId);
      await user.save();
    }

    const updatedUser = await User.findById(req.user._id).populate('wishlist');
    res.json(updatedUser.wishlist);
  } catch (error) {
    next(error);
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:id
// @access  Private
const removeFromWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    user.wishlist = user.wishlist.filter(
      (fav) => fav.toString() !== req.params.id
    );

    await user.save();

    const updatedUser = await User.findById(req.user._id).populate('wishlist');
    res.json(updatedUser.wishlist);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};
