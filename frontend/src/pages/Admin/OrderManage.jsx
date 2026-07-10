import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Loader from '../../components/ui/Loader';
import Badge from '../../components/ui/Badge';
import { Eye, Edit2 } from 'lucide-react';

const OrderManage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/orders/all');
      setOrders(data);
    } catch (err) {
      console.error('Failed to load all orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const { data } = await api.put(`/api/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, orderStatus: data.orderStatus, paymentStatus: data.paymentStatus, deliveredAt: data.deliveredAt } : o))
      );
      alert(`Order status updated to "${newStatus}"`);
    } catch (err) {
      alert(err.customMessage || 'Failed to update order status');
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'Placed':
        return 'primary';
      case 'Processing':
        return 'warning';
      case 'Shipped':
        return 'info';
      case 'Delivered':
        return 'success';
      case 'Cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader size="large" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-150 pb-4 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-slate-50">
            Order Management
          </h1>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            Review client transaction records and update tracking states.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to="/admin/dashboard"
            className="rounded-lg border border-gray-250 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 dark:border-slate-800 dark:text-slate-350 dark:hover:bg-slate-800/40"
          >
            Metrics
          </Link>
          <Link
            to="/admin/products"
            className="rounded-lg border border-gray-250 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 dark:border-slate-800 dark:text-slate-350 dark:hover:bg-slate-800/40"
          >
            Products
          </Link>
          <Link
            to="/admin/categories"
            className="rounded-lg border border-gray-250 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 dark:border-slate-800 dark:text-slate-350 dark:hover:bg-slate-800/40"
          >
            Categories
          </Link>
          <Link
            to="/admin/orders"
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white dark:bg-slate-100 dark:text-slate-900"
          >
            Orders
          </Link>
          <Link
            to="/admin/users"
            className="rounded-lg border border-gray-250 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 dark:border-slate-800 dark:text-slate-350 dark:hover:bg-slate-800/40"
          >
            Users
          </Link>
        </div>
      </div>

      {/* Orders List Table */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-slate-850 dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-150 text-xs font-bold text-gray-400 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-850/30">
                <th className="p-4">Order ID</th>
                <th className="p-4">Date</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Bill Total</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Status / Update</th>
                <th className="p-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-850 text-xs text-gray-700 dark:text-slate-350">
              {orders.map((ord) => (
                <tr key={ord._id} className="hover:bg-gray-50/30 dark:hover:bg-slate-800/10">
                  <td className="p-4 font-extrabold text-gray-900 dark:text-slate-200">
                    #{ord._id.slice(-8).toUpperCase()}
                  </td>
                  <td className="p-4">
                    {new Date(ord.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <p className="font-semibold text-gray-800 dark:text-slate-200">{ord.user?.name}</p>
                    <p className="text-[10px] text-gray-400">{ord.user?.email}</p>
                  </td>
                  <td className="p-4 font-black text-gray-900 dark:text-slate-100">
                    ${ord.totalAmount.toFixed(2)}
                  </td>
                  <td className="p-4">
                    <Badge variant={ord.paymentStatus === 'Completed' ? 'success' : 'warning'}>
                      {ord.paymentStatus}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <select
                        value={ord.orderStatus}
                        onChange={(e) => handleStatusChange(ord._id, e.target.value)}
                        className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs outline-none focus:border-primary-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                      >
                        <option value="Placed">Placed</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      to={`/orders/${ord._id}`}
                      className="inline-flex items-center gap-1 font-bold text-primary-600 hover:text-primary-500"
                    >
                      <Eye size={14} /> VIEW
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderManage;
