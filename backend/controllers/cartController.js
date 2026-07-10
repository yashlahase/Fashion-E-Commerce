const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Helper to recalculate total cart price
const recalculateCart = (cart) => {
  cart.totalPrice = cart.items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
  // Round to 2 decimal places
  cart.totalPrice = Math.round(cart.totalPrice * 100) / 100;
};

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    if (!cart) {
      // Create empty cart for new user
      cart = await Cart.create({
        user: req.user._id,
        items: [],
        totalPrice: 0,
      });
    }

    res.json(cart);
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
const addToCart = async (req, res, next) => {
  try {
    const { productId, size, quantity } = req.body;

    if (!productId || !size || !quantity) {
      res.status(400);
      return next(new Error('Please provide product, size and quantity'));
    }

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      return next(new Error('Product not found'));
    }

    // Determine final price (apply discount if exists)
    const price = product.discountPrice && product.discountPrice > 0 
      ? product.discountPrice 
      : product.price;

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({
        user: req.user._id,
        items: [],
        totalPrice: 0,
      });
    }

    // Check if product with same size already in cart
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId && item.size === size
    );

    if (itemIndex > -1) {
      // Item exists, update quantity
      cart.items[itemIndex].quantity += Number(quantity);
      cart.items[itemIndex].price = price; // sync price in case it changed
    } else {
      // Item does not exist, push new item
      cart.items.push({
        product: productId,
        size,
        quantity: Number(quantity),
        price,
      });
    }

    recalculateCart(cart);
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate('items.product');
    res.status(200).json(populatedCart);
  } catch (error) {
    next(error);
  }
};

// @desc    Update item quantity in cart
// @route   PUT /api/cart/update
// @access  Private
const updateCartItem = async (req, res, next) => {
  try {
    const { productId, size, quantity } = req.body;

    if (!productId || !size || quantity === undefined) {
      res.status(400);
      return next(new Error('Please provide product ID, size and quantity'));
    }

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      res.status(404);
      return next(new Error('Cart not found'));
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId && item.size === size
    );

    if (itemIndex > -1) {
      if (Number(quantity) <= 0) {
        // Remove item if quantity is 0 or negative
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = Number(quantity);
      }
      
      recalculateCart(cart);
      await cart.save();

      const populatedCart = await Cart.findById(cart._id).populate('items.product');
      res.json(populatedCart);
    } else {
      res.status(404);
      return next(new Error('Item not found in cart'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove
// @access  Private
const removeFromCart = async (req, res, next) => {
  try {
    const { productId, size } = req.body; // Check body first
    const pId = productId || req.query.productId;
    const sz = size || req.query.size;

    if (!pId || !sz) {
      res.status(400);
      return next(new Error('Please provide product ID and size'));
    }

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      res.status(404);
      return next(new Error('Cart not found'));
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === pId && item.size === sz
    );

    if (itemIndex > -1) {
      cart.items.splice(itemIndex, 1);
      recalculateCart(cart);
      await cart.save();

      const populatedCart = await Cart.findById(cart._id).populate('items.product');
      res.json(populatedCart);
    } else {
      res.status(404);
      return next(new Error('Item not found in cart'));
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
};
