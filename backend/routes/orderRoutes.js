const express = require('express');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getDashboardStats,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // All order routes require authentication

router.route('/')
  .post(createOrder);

router.get('/my', getMyOrders);
router.get('/all', admin, getAllOrders);
router.get('/dashboard/stats', admin, getDashboardStats);

router.route('/:id')
  .get(getOrderById);

router.route('/:id/status')
  .put(admin, updateOrderStatus);

module.exports = router;
