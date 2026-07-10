const Review = require('../models/Review');
const Product = require('../models/Product');

// @desc    Create a product review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res, next) => {
  try {
    const { productId, rating, comment } = req.body;

    if (!productId || rating === undefined || !comment) {
      res.status(400);
      return next(new Error('Please provide product ID, rating and comment'));
    }

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      return next(new Error('Product not found'));
    }

    // Check if user already reviewed this product
    const alreadyReviewed = await Review.findOne({
      user: req.user._id,
      product: productId,
    });

    if (alreadyReviewed) {
      res.status(400);
      return next(new Error('You have already reviewed this product'));
    }

    const review = await Review.create({
      user: req.user._id,
      product: productId,
      rating: Number(rating),
      comment,
    });

    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
const getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getProductReviews,
};
