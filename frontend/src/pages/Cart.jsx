import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import EmptyState from '../components/EmptyState';
import Loader from '../components/ui/Loader';
import { ShoppingBag, Trash2, Tag, Percent, ArrowRight } from 'lucide-react';

const Cart = () => {
  const navigate = useNavigate();
  const {
    cart,
    loading,
    coupon,
    updateCartItem,
    removeFromCart,
    applyCoupon,
    removeCoupon,
    discountAmount,
    finalPrice,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const handleQtyChange = async (productId, size, currentQty, amount) => {
    const newQty = currentQty + amount;
    if (newQty <= 0) {
      await handleRemoveItem(productId, size);
    } else {
      try {
        await updateCartItem(productId, size, newQty);
      } catch (err) {
        alert(err.message || 'Failed to update item quantity');
      }
    }
  };

  const handleRemoveItem = async (productId, size) => {
    try {
      await removeFromCart(productId, size);
    } catch (err) {
      alert(err.message || 'Failed to remove item');
    }
  };

  const handleCouponApply = async (e) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    if (!couponCode.trim()) return;

    setValidatingCoupon(true);
    try {
      const data = await applyCoupon(couponCode);
      setCouponSuccess(`Coupon "${data.code}" applied successfully!`);
      setCouponCode('');
    } catch (err) {
      setCouponError(err.message || 'Invalid or expired coupon code');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleCheckoutClick = () => {
    navigate('/checkout');
  };

  if (loading && !cart) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader size="large" />
      </div>
    );
  }

  const items = cart?.items || [];
  const totalPrice = cart?.totalPrice || 0;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="border-b border-gray-150 pb-4 dark:border-slate-800">
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-slate-50">
          Shopping Cart
        </h1>
        <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
          You have {items.length} unique products in your bag.
        </p>
      </div>

      {items.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Items Column */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const prod = item.product;
              if (!prod) return null;
              
              const hasDiscount = prod.discountPrice && prod.discountPrice > 0;
              const displayPrice = hasDiscount ? prod.discountPrice : prod.price;

              return (
                <div
                  key={`${item.product._id || item.product}-${item.size}`}
                  className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-4 dark:border-slate-850 dark:bg-slate-900"
                >
                  <Link
                    to={`/products/${prod._id}`}
                    className="aspect-[3/4] w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-slate-800"
                  >
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      className="h-full w-full object-cover"
                    />
                  </Link>

                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex justify-between gap-2">
                        <Link
                          to={`/products/${prod._id}`}
                          className="font-semibold text-gray-900 hover:text-primary-600 dark:text-slate-100 dark:hover:text-primary-400 text-sm sm:text-base line-clamp-1"
                        >
                          {prod.name}
                        </Link>
                        <button
                          onClick={() => handleRemoveItem(prod._id, item.size)}
                          className="text-gray-400 hover:text-red-500 transition"
                          aria-label="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <span className="text-[11px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider block mt-0.5">
                        {prod.brand}
                      </span>
                      <div className="mt-2 flex gap-4 text-xs font-semibold text-gray-500 dark:text-slate-400">
                        <span>Size: <span className="text-gray-800 dark:text-slate-200">{item.size}</span></span>
                        <span>Price: <span className="text-gray-800 dark:text-slate-200">₹{Math.round(displayPrice).toLocaleString('en-IN')}</span></span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      {/* Quantity Selector */}
                      <div className="flex items-center rounded-lg border border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-850">
                        <button
                          onClick={() => handleQtyChange(prod._id, item.size, item.quantity, -1)}
                          className="px-2 py-0.5 text-sm font-bold text-gray-500 dark:text-slate-400"
                        >
                          -
                        </button>
                        <span className="px-2.5 text-xs font-semibold text-gray-800 dark:text-slate-200">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQtyChange(prod._id, item.size, item.quantity, 1)}
                          className="px-2 py-0.5 text-sm font-bold text-gray-500 dark:text-slate-400"
                        >
                          +
                        </button>
                      </div>

                      {/* Total price for this item row */}
                      <span className="text-sm font-extrabold text-gray-900 dark:text-slate-100">
                        ₹{Math.round(displayPrice * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pricing Column */}
          <div className="space-y-6">
            {/* Coupon Application Panel */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-slate-850 dark:bg-slate-900">
              <h3 className="text-sm font-bold text-gray-950 dark:text-slate-50 flex items-center gap-2">
                <Tag size={16} /> Promo Coupon
              </h3>

              {couponError && (
                <div className="mt-3 rounded-lg bg-red-50 p-2.5 text-xs font-semibold text-red-600 dark:bg-red-950/20 dark:text-red-400">
                  {couponError}
                </div>
              )}
              {couponSuccess && (
                <div className="mt-3 rounded-lg bg-green-50 p-2.5 text-xs font-semibold text-green-600 dark:bg-green-950/20 dark:text-green-400">
                  {couponSuccess}
                </div>
              )}

              {coupon ? (
                <div className="mt-4 flex items-center justify-between rounded-xl bg-primary-50/50 p-3 border border-primary-200 dark:bg-primary-950/20 dark:border-primary-900/40">
                  <div className="flex items-center gap-2">
                    <Percent size={15} className="text-primary-600 dark:text-primary-400" />
                    <div>
                      <p className="text-xs font-extrabold text-primary-800 dark:text-primary-300">
                        {coupon.code}
                      </p>
                      <p className="text-[10px] text-primary-600 dark:text-primary-400">
                        {coupon.discountType === 'percentage' 
                          ? `${coupon.discountAmount}% Discount Applied` 
                          : `₹${coupon.discountAmount} Flat Discount Applied`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs font-bold text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCouponApply} className="mt-4 flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. WELCOME10"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs font-semibold outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                  <button
                    type="submit"
                    disabled={validatingCoupon}
                    className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold tracking-wider text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                  >
                    {validatingCoupon ? '...' : 'APPLY'}
                  </button>
                </form>
              )}
            </div>

            {/* Price Summary Panel */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-slate-850 dark:bg-slate-900">
              <h3 className="text-sm font-bold text-gray-950 dark:text-slate-50 border-b border-gray-100 pb-3 dark:border-slate-800">
                Order Summary
              </h3>

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between text-gray-500 dark:text-slate-400">
                  <span>Bag Subtotal</span>
                  <span className="font-semibold text-gray-800 dark:text-slate-200">
                    ₹{Math.round(totalPrice).toLocaleString('en-IN')}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Coupon Discount</span>
                    <span className="font-semibold">
                      -₹{Math.round(discountAmount).toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-gray-500 dark:text-slate-400">
                  <span>Shipping</span>
                  <span className="font-semibold text-gray-800 dark:text-slate-200">
                    {totalPrice >= 999 ? 'FREE' : '₹99.00'}
                  </span>
                </div>
                
                <div className="border-t border-gray-100 pt-3 dark:border-slate-800 flex justify-between text-base font-extrabold text-gray-950 dark:text-slate-50">
                  <span>Total Amount</span>
                  <span>
                    ₹{Math.round(finalPrice + (totalPrice >= 999 ? 0 : 99)).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckoutClick}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 py-3 text-sm font-semibold tracking-wider text-white shadow-md hover:bg-slate-850 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
              >
                PROCEED TO CHECKOUT <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-12">
          <EmptyState
            icon={ShoppingBag}
            title="Your bag is empty"
            description="Looks like you haven't added any fashion items to your shopping cart yet."
            actionText="Go Catalog"
            actionLink="/products"
          />
        </div>
      )}
    </div>
  );
};

export default Cart;
