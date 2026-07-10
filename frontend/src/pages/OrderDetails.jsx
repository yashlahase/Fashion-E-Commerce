import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Loader from '../components/ui/Loader';
import Badge from '../components/ui/Badge';
import { ArrowLeft, MapPin, CreditCard, ShoppingBag, Truck, CheckCircle2 } from 'lucide-react';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/api/orders/${id}`);
        setOrder(data);
      } catch (err) {
        console.error('Failed to load order:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader size="large" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <h2 className="text-xl font-bold">Order Not Found</h2>
        <Link to="/orders" className="mt-4 inline-block text-primary-600">
          Back to Orders
        </Link>
      </div>
    );
  }

  // Tracking stepper helper
  const getStepStatusClass = (step) => {
    const statuses = ['Placed', 'Processing', 'Shipped', 'Delivered'];
    const currentIndex = statuses.indexOf(order.orderStatus);
    const stepIndex = statuses.indexOf(step);

    if (order.orderStatus === 'Cancelled') {
      return stepIndex === 0 ? 'text-red-500 bg-red-50 dark:bg-red-950/20' : 'text-gray-300 bg-gray-50';
    }

    if (stepIndex <= currentIndex) {
      return 'text-primary-600 bg-primary-50 border-primary-200 dark:text-primary-400 dark:bg-primary-950/30';
    }
    return 'text-gray-400 bg-gray-50 border-gray-100 dark:text-slate-600 dark:bg-slate-800 dark:border-slate-800';
  };

  const isDelivered = order.orderStatus === 'Delivered';

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      {/* Header with Back Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-150 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            to="/orders"
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label="Back to orders"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-gray-950 dark:text-slate-50 flex items-center gap-2 flex-wrap">
              Order #{order._id}
              <Badge variant={order.orderStatus === 'Cancelled' ? 'danger' : 'primary'}>
                {order.orderStatus}
              </Badge>
            </h1>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* 1. Stepper Progress Tracker */}
      <div className="rounded-2xl border border-gray-250 bg-white p-6 dark:border-slate-850 dark:bg-slate-900">
        <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100">Tracking Progress</h3>
        
        {order.orderStatus === 'Cancelled' ? (
          <div className="mt-4 p-4 rounded-xl bg-red-50 text-red-700 text-sm font-semibold dark:bg-red-950/20 dark:text-red-400">
            This order was Cancelled.
          </div>
        ) : (
          <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 sm:gap-2">
            {['Placed', 'Processing', 'Shipped', 'Delivered'].map((step, idx) => (
              <div key={step} className="flex sm:flex-col items-center gap-3 sm:gap-1.5 flex-1 w-full">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 font-bold text-sm ${getStepStatusClass(
                    step
                  )}`}
                >
                  {idx + 1}
                </div>
                <div className="text-left sm:text-center">
                  <p className="text-xs font-bold text-gray-800 dark:text-slate-200">{step}</p>
                  {step === 'Delivered' && isDelivered && order.deliveredAt && (
                    <p className="text-[10px] text-gray-400">
                      {new Date(order.deliveredAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Grid Split: Info cards & Items review */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Left Column: Address and Payment */}
        <div className="md:col-span-1 space-y-6">
          {/* Shipping Address Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-slate-850 dark:bg-slate-900">
            <h3 className="text-sm font-bold text-gray-950 dark:text-slate-50 flex items-center gap-2">
              <MapPin size={16} className="text-primary-600" /> Shipping Address
            </h3>
            <div className="mt-4 text-xs text-gray-600 dark:text-slate-400 space-y-1">
              <p className="font-extrabold text-gray-900 dark:text-slate-200">
                {order.shippingAddress.name}
              </p>
              <p>{order.shippingAddress.address}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
              <p className="pt-2 font-semibold text-gray-700 dark:text-slate-300">
                Phone: {order.shippingAddress.phone}
              </p>
            </div>
          </div>

          {/* Payment Details Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-slate-850 dark:bg-slate-900">
            <h3 className="text-sm font-bold text-gray-950 dark:text-slate-50 flex items-center gap-2">
              <CreditCard size={16} className="text-primary-600" /> Payment Info
            </h3>
            <div className="mt-4 text-xs text-gray-600 dark:text-slate-400 space-y-1.5 text-left">
              <p>
                Method:{' '}
                <strong className="text-gray-900 dark:text-slate-200">
                  {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Credit/Debit Card'}
                </strong>
              </p>
              <p>
                Status:{' '}
                <Badge
                  variant={order.paymentStatus === 'Completed' ? 'success' : 'warning'}
                  className="ml-1"
                >
                  {order.paymentStatus}
                </Badge>
              </p>
              {order.paymentInfo && order.paymentInfo.cardMasked && (
                <div className="mt-2 border-t border-gray-150 pt-2 dark:border-slate-800 space-y-1">
                  <p className="text-[10px] text-gray-450 dark:text-slate-500">
                    Brand: <strong className="text-gray-800 dark:text-slate-250 ml-1">{order.paymentInfo.cardType}</strong>
                  </p>
                  <p className="text-[10px] text-gray-450 dark:text-slate-500">
                    Number: <strong className="text-gray-800 dark:text-slate-250 ml-1">{order.paymentInfo.cardMasked}</strong>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: itemized lists and total bills */}
        <div className="md:col-span-2 space-y-6">
          {/* Itemized List */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-slate-850 dark:bg-slate-900">
            <h3 className="text-sm font-bold text-gray-950 dark:text-slate-50 flex items-center gap-2">
              <ShoppingBag size={16} className="text-primary-600" /> Items List
            </h3>

            <div className="mt-4 divide-y divide-gray-150 dark:divide-slate-850">
              {order.items.map((item) => (
                <div key={item._id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                  <img
                    src={item.image}
                    alt=""
                    className="aspect-[3/4] w-14 rounded-lg object-cover bg-gray-50 border border-gray-100 dark:border-slate-800"
                  />
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-gray-800 dark:text-slate-200 line-clamp-1">
                      {item.name}
                    </h4>
                    <p className="text-[10px] text-gray-400">
                      Size: {item.size} &middot; Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="text-xs font-extrabold text-gray-900 dark:text-slate-100">
                    ₹{Math.round(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals Breakdown */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-slate-850 dark:bg-slate-900">
            <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100 border-b border-gray-100 pb-3 dark:border-slate-800">
              Cost Summary
            </h3>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex justify-between text-gray-500 dark:text-slate-400">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-800 dark:text-slate-200">
                  ₹{Math.round(order.totalAmount + order.discountAmount).toLocaleString('en-IN')}
                </span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>Discount</span>
                  <span className="font-semibold">
                    -₹{Math.round(order.discountAmount).toLocaleString('en-IN')}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-gray-500 dark:text-slate-400">
                <span>Shipping Fee</span>
                <span className="font-semibold text-gray-800 dark:text-slate-200">
                  {order.totalAmount >= 999 ? 'FREE' : '₹99.00'}
                </span>
              </div>
              <div className="border-t border-gray-100 pt-3 dark:border-slate-800 flex justify-between text-sm font-black text-gray-950 dark:text-slate-50">
                <span>Total Bill Paid</span>
                <span>
                  ₹{Math.round(order.totalAmount + (order.totalAmount >= 999 ? 0 : 99)).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
