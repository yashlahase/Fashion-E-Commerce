const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Coupon = require('../models/Coupon');

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod, couponCode, paymentInfo } = req.body;

    if (!items || items.length === 0) {
      res.status(400);
      return next(new Error('No order items provided'));
    }

    if (!shippingAddress) {
      res.status(400);
      return next(new Error('Please provide shipping address'));
    }

    // 1. Verify product stock levels first
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        res.status(404);
        return next(new Error(`Product not found: ${item.name || 'Unknown Item'}`));
      }
      if (product.stock < item.quantity) {
        res.status(400);
        return next(
          new Error(
            `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}`
          )
        );
      }
    }

    // 2. Calculate prices & verify totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      const price = product.discountPrice && product.discountPrice > 0 
        ? product.discountPrice 
        : product.price;

      subtotal += price * item.quantity;

      orderItems.push({
        product: item.product,
        name: product.name,
        quantity: item.quantity,
        price: price,
        size: item.size,
        image: product.images[0] || '',
      });
    }

    // 3. Handle coupon code discount
    let discountAmount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon && coupon.expiryDate > new Date()) {
        if (coupon.discountType === 'percentage') {
          discountAmount = subtotal * (coupon.discountAmount / 100);
        } else if (coupon.discountType === 'fixed') {
          discountAmount = coupon.discountAmount;
        }
        // Discount cannot exceed subtotal
        discountAmount = Math.min(discountAmount, subtotal);
      }
    }

    const totalAmount = Math.max(0, subtotal - discountAmount);

    // 4. Perform stock reduction
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    // 5. Create the Order document
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'Card',
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Completed', // simulate successful payment for Card
      paymentInfo: paymentMethod === 'COD' ? undefined : paymentInfo,
      totalAmount: Math.round(totalAmount * 100) / 100,
      discountAmount: Math.round(discountAmount * 100) / 100,
      orderStatus: 'Placed',
    });

    // 6. Clear user cart
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { items: [], totalPrice: 0 }
    );

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my
// @access  Private
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email');

    if (order) {
      // Check if logged in user is admin or the owner of order
      if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403);
        return next(new Error('Not authorized to view this order'));
      }
      res.json(order);
    } else {
      res.status(404);
      return next(new Error('Order not found'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders/all
// @access  Private/Admin
const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      res.status(400);
      return next(new Error('Please provide order status'));
    }

    const order = await Order.findById(req.params.id);

    if (order) {
      order.orderStatus = status;
      if (status === 'Delivered') {
        order.deliveredAt = Date.now();
        order.paymentStatus = 'Completed'; // Mark as completed on delivery (e.g. for COD)
      }
      
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404);
      return next(new Error('Order not found'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard analytics metrics
// @route   GET /api/orders/dashboard/stats
// @access  Private/Admin
const getDashboardStats = async (req, res, next) => {
  try {
    const totalOrders = await Order.countDocuments({});
    const totalProducts = await Product.countDocuments({});
    const totalUsers = await Product.model('User').countDocuments({});
    
    // Calculate total revenue
    const orders = await Order.find({ paymentStatus: 'Completed' });
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Sales by Category
    const categorySales = await Order.aggregate([
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      {
        $lookup: {
          from: 'categories',
          localField: 'productDetails.category',
          foreignField: '_id',
          as: 'categoryDetails'
        }
      },
      { $unwind: '$categoryDetails' },
      {
        $group: {
          _id: '$categoryDetails.name',
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          units: { $sum: '$items.quantity' }
        }
      }
    ]);

    // Monthly Sales revenue trends (past 6 months)
    const monthlySales = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 5))
          },
          paymentStatus: 'Completed'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      metrics: {
        totalOrders,
        totalProducts,
        totalUsers,
        totalRevenue: Math.round(totalRevenue * 100) / 100
      },
      categorySales,
      monthlySales
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getDashboardStats,
};
