import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import EmptyState from '../components/EmptyState';
import Loader from '../components/ui/Loader';
import Badge from '../components/ui/Badge';
import { CheckCircle2, ShoppingBag, Eye, Calendar, IndianRupee } from 'lucide-react';

const Orders = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const isSuccess = searchParams.get('success') === 'true';
  const successOrderId = searchParams.get('orderId');

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/api/orders/my');
        setOrders(data);
      } catch (err) {
        console.error('Failed to load my orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader size="large" />
      </div>
    );
  }

  // Get status badge variant
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

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      {/* Success Banner */}
      {isSuccess && successOrderId && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-6 dark:border-green-950/20 dark:bg-green-950/20 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400 shrink-0 animate-bounce" />
          <div>
            <h2 className="text-lg font-bold text-green-800 dark:text-green-300">
              Order Placed Successfully!
            </h2>
            <p className="mt-1 text-sm text-green-700 dark:text-green-400">
              Thank you for your purchase. Your order ID is{' '}
              <Link to={`/orders/${successOrderId}`} className="font-extrabold underline">
                #{successOrderId}
              </Link>
              . We have initialized stock verification and processing steps.
            </p>
          </div>
        </div>
      )}

      <div className="border-b border-gray-150 pb-4 dark:border-slate-800">
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-slate-50">
          My Order History
        </h1>
        <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
          View details and tracking states for all your orders.
        </p>
      </div>

      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-slate-850 dark:bg-slate-900 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              {/* Order Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm font-black text-gray-900 dark:text-slate-100">
                    Order #{order._id}
                  </span>
                  <Badge variant={getStatusVariant(order.orderStatus)}>
                    {order.orderStatus}
                  </Badge>
                </div>
                <div className="flex items-center gap-6 text-xs text-gray-500 dark:text-slate-400 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Calendar size={13} />
                    {new Date(order.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <IndianRupee size={13} />
                    Total: <strong className="text-gray-800 dark:text-slate-200">₹{Math.round(order.totalAmount).toLocaleString('en-IN')}</strong>
                  </span>
                  <span>
                    Items: {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                </div>
              </div>

              {/* Product Images Preview */}
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar md:justify-center">
                {order.items.slice(0, 4).map((item, idx) => (
                  <img
                    key={idx}
                    src={item.image}
                    alt=""
                    className="aspect-[3/4] w-10 rounded-md object-cover bg-gray-50 border border-gray-100 dark:border-slate-800"
                  />
                ))}
                {order.items.length > 4 && (
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100 text-xs font-bold text-gray-500 dark:bg-slate-800 dark:text-slate-400">
                    +{order.items.length - 4}
                  </span>
                )}
              </div>

              {/* Action Button */}
              <Link
                to={`/orders/${order._id}`}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-250 px-4 py-2.5 text-xs font-bold tracking-wider text-gray-700 hover:bg-gray-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800/40 self-start md:self-auto"
              >
                <Eye size={14} /> VIEW DETAILS
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-12">
          <EmptyState
            icon={ShoppingBag}
            title="No orders found"
            description="You haven't placed any orders yet. Head to the store to make your first purchase!"
            actionText="Browse Shop"
            actionLink="/products"
          />
        </div>
      )}
    </div>
  );
};

export default Orders;
