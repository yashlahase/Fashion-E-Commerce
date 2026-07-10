import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Loader from '../components/ui/Loader';
import { Landmark, CreditCard, ChevronRight, ShoppingBag, Truck, Banknote } from 'lucide-react';

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, coupon, discountAmount, finalPrice, clearCartLocally } = useCart();
  
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [step, setStep] = useState(1); // 1: Shipping Address, 2: Payment & Review

  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardType, setCardType] = useState('Visa');
  const [cardErrors, setCardErrors] = useState({});

  const handleCardNumberChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 16);
    if (val.startsWith('4')) {
      setCardType('Visa');
    } else if (val.startsWith('5')) {
      setCardType('MasterCard');
    } else if (val.startsWith('6')) {
      setCardType('RuPay');
    } else if (val.startsWith('3')) {
      setCardType('American Express');
    }
    
    let formatted = val.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  const handleCardExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 2) {
      val = val.slice(0, 2) + '/' + val.slice(2);
    }
    setCardExpiry(val);
  };

  const handleCardCvvChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCardCvv(val);
  };

  const validateCard = () => {
    let errs = {};
    if (!cardHolder.trim()) {
      errs.cardHolder = 'Card Holder Name is required';
    }
    const cleanNum = cardNumber.replace(/\s+/g, '');
    if (!cleanNum || cleanNum.length < 15) {
      errs.cardNumber = 'Enter a valid 15 or 16-digit card number';
    }
    if (!cardExpiry || cardExpiry.length !== 5) {
      errs.cardExpiry = 'Expiry must be in MM/YY format';
    } else {
      const [month, year] = cardExpiry.split('/').map(Number);
      if (month < 1 || month > 12) {
        errs.cardExpiry = 'Invalid expiry month';
      } else {
        const now = new Date();
        const currentYear = now.getFullYear() % 100;
        const currentMonth = now.getMonth() + 1;
        if (year < currentYear || (year === currentYear && month < currentMonth)) {
          errs.cardExpiry = 'Card has expired';
        }
      }
    }
    if (!cardCvv || (cardCvv.length !== 3 && cardCvv.length !== 4)) {
      errs.cardCvv = 'CVV must be 3 or 4 digits';
    }
    setCardErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      address: user?.address || '',
      city: '',
      state: '',
      postalCode: '',
      country: 'United States',
      phone: user?.phone || '',
    },
  });

  // Prepopulate form if user profile finishes loading
  useEffect(() => {
    if (user) {
      setValue('name', user.name || '');
      setValue('address', user.address || '');
      setValue('phone', user.phone || '');
    }
  }, [user, setValue]);

  // Block entry if cart is empty
  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }
    if (cart && cart.items.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  const onAddressSubmit = () => {
    setStep(2); // Go to review and payment step
  };

  const handlePlaceOrder = async (addressData) => {
    if (paymentMethod === 'Credit Card' || paymentMethod === 'Debit Card') {
      const isCardValid = validateCard();
      if (!isCardValid) {
        return;
      }
    }

    setSubmittingOrder(true);
    try {
      const orderData = {
        items: cart.items.map((item) => ({
          product: item.product._id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.price,
          size: item.size,
        })),
        shippingAddress: {
          name: addressData.name,
          address: addressData.address,
          city: addressData.city,
          state: addressData.state,
          postalCode: addressData.postalCode,
          country: addressData.country,
          phone: addressData.phone,
        },
        paymentMethod,
        couponCode: coupon?.code || '',
        paymentInfo: (paymentMethod === 'Credit Card' || paymentMethod === 'Debit Card') ? {
          cardMasked: `•••• •••• •••• ${cardNumber.replace(/\s+/g, '').slice(-4)}`,
          cardType,
        } : undefined,
      };

      const { data } = await api.post('/api/orders', orderData);
      
      // Clear cart locally
      clearCartLocally();
      
      // Navigate to success screen
      navigate(`/orders?success=true&orderId=${data._id}`);
    } catch (err) {
      alert(err.customMessage || 'Failed to place order. Try again.');
    } finally {
      setSubmittingOrder(false);
    }
  };

  if (!cart) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader size="large" />
      </div>
    );
  }

  const items = cart.items;
  const totalPrice = cart.totalPrice;
  const shippingFee = totalPrice >= 999 ? 0 : 99;
  const totalBillAmount = finalPrice + shippingFee;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Breadcrumb Flow */}
      <nav aria-label="Progress" className="border-b border-gray-150 pb-4 mb-8 dark:border-slate-800">
        <ol className="flex items-center gap-2 text-xs font-semibold text-gray-500">
          <li>
            <span className="text-gray-900 dark:text-slate-100">Cart</span>
          </li>
          <li>
            <ChevronRight size={12} />
          </li>
          <li>
            <span className={step === 1 ? 'text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-slate-100'}>
              Shipping Address
            </span>
          </li>
          <li>
            <ChevronRight size={12} />
          </li>
          <li>
            <span className={step === 2 ? 'text-primary-600 dark:text-primary-400' : ''}>
              Review & Payment
            </span>
          </li>
        </ol>
      </nav>

      {submittingOrder ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Loader size="large" />
          <h2 className="mt-6 text-xl font-bold text-gray-900 dark:text-slate-50">
            Simulating Transaction Payment Gateway
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
            Processing card credentials securely and verifying inventory stock. Please wait...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(step === 1 ? onAddressSubmit : handlePlaceOrder)}>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Step Content Column */}
            <div className="lg:col-span-2 space-y-6">
              {step === 1 ? (
                /* STEP 1: Shipping Form */
                <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-slate-850 dark:bg-slate-900 space-y-4">
                  <h2 className="text-lg font-bold text-gray-950 dark:text-slate-50 flex items-center gap-2">
                    <Truck size={20} className="text-primary-600" /> Shipping Details
                  </h2>

                  {/* Recipient Name */}
                  <div className="flex flex-col gap-1">
                    <label htmlFor="name" className="text-xs font-bold text-gray-500 dark:text-slate-400">
                      Recipient Full Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      autoComplete="name"
                      {...register('name', { required: 'Name is required' })}
                      className="rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                    {errors.name && (
                      <span className="text-[10px] text-red-500">{errors.name.message}</span>
                    )}
                  </div>

                  {/* Street Address */}
                  <div className="flex flex-col gap-1">
                    <label htmlFor="address" className="text-xs font-bold text-gray-500 dark:text-slate-400">
                      Street Address
                    </label>
                    <textarea
                      id="address"
                      rows="2"
                      autoComplete="street-address"
                      {...register('address', { required: 'Street address is required' })}
                      className="rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                    {errors.address && (
                      <span className="text-[10px] text-red-500">{errors.address.message}</span>
                    )}
                  </div>

                  {/* City and State grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label htmlFor="city" className="text-xs font-bold text-gray-500 dark:text-slate-400">
                        City
                      </label>
                      <input
                        id="city"
                        type="text"
                        autoComplete="address-level2"
                        {...register('city', { required: 'City is required' })}
                        className="rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      />
                      {errors.city && (
                        <span className="text-[10px] text-red-500">{errors.city.message}</span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <label htmlFor="state" className="text-xs font-bold text-gray-500 dark:text-slate-400">
                        State / Province
                      </label>
                      <input
                        id="state"
                        type="text"
                        autoComplete="address-level1"
                        {...register('state', { required: 'State is required' })}
                        className="rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      />
                      {errors.state && (
                        <span className="text-[10px] text-red-500">{errors.state.message}</span>
                      )}
                    </div>
                  </div>

                  {/* Postal code & Country */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label htmlFor="postalCode" className="text-xs font-bold text-gray-500 dark:text-slate-400">
                        ZIP / Postal Code
                      </label>
                      <input
                        id="postalCode"
                        type="text"
                        autoComplete="postal-code"
                        {...register('postalCode', { required: 'Postal code is required' })}
                        className="rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      />
                      {errors.postalCode && (
                        <span className="text-[10px] text-red-500">{errors.postalCode.message}</span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <label htmlFor="country" className="text-xs font-bold text-gray-500 dark:text-slate-400">
                        Country
                      </label>
                      <input
                        id="country"
                        type="text"
                        autoComplete="country-name"
                        {...register('country', { required: 'Country is required' })}
                        className="rounded-xl border border-gray-350 px-3 py-2.5 text-sm outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col gap-1">
                    <label htmlFor="phone" className="text-xs font-bold text-gray-500 dark:text-slate-400">
                      Contact Phone Number
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      autoComplete="tel"
                      {...register('phone', { required: 'Phone is required' })}
                      className="rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                    {errors.phone && (
                      <span className="text-[10px] text-red-500">{errors.phone.message}</span>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-4 rounded-xl bg-slate-900 py-3 text-sm font-semibold tracking-wider text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                  >
                    CONTINUE TO PAYMENT
                  </button>
                </div>
              ) : (
                /* STEP 2: Payment Selection & Review Items */
                <div className="space-y-6">
                  {/* Payment Select */}
                  <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-slate-850 dark:bg-slate-900">
                    <h2 className="text-lg font-bold text-gray-950 dark:text-slate-50">Select Payment Method</h2>
                    
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Cash on Delivery option */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('COD')}
                        className={`flex flex-col items-center gap-3 rounded-xl border p-4 transition text-center ${
                          paymentMethod === 'COD'
                            ? 'border-primary-600 bg-primary-50/20 text-primary-900 dark:border-primary-500 dark:bg-primary-950/20 dark:text-primary-100'
                            : 'border-gray-200 text-gray-600 dark:border-slate-800 dark:text-slate-400 hover:bg-gray-50/50'
                        }`}
                      >
                        <Banknote size={24} />
                        <div>
                          <p className="text-sm font-bold">Cash on Delivery</p>
                          <p className="text-[10px] text-gray-400">Pay when order is delivered</p>
                        </div>
                      </button>

                      {/* Credit Card option */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('Credit Card')}
                        className={`flex flex-col items-center gap-3 rounded-xl border p-4 transition text-center ${
                          paymentMethod === 'Credit Card'
                            ? 'border-primary-600 bg-primary-50/20 text-primary-900 dark:border-primary-500 dark:bg-primary-950/20 dark:text-primary-100'
                            : 'border-gray-200 text-gray-600 dark:border-slate-800 dark:text-slate-400 hover:bg-gray-50/50'
                        }`}
                      >
                        <CreditCard size={24} />
                        <div>
                          <p className="text-sm font-bold">Credit Card</p>
                          <p className="text-[10px] text-gray-400">Pay via Credit Card</p>
                        </div>
                      </button>

                      {/* Debit Card option */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('Debit Card')}
                        className={`flex flex-col items-center gap-3 rounded-xl border p-4 transition text-center ${
                          paymentMethod === 'Debit Card'
                            ? 'border-primary-600 bg-primary-50/20 text-primary-900 dark:border-primary-500 dark:bg-primary-950/20 dark:text-primary-100'
                            : 'border-gray-200 text-gray-600 dark:border-slate-800 dark:text-slate-400 hover:bg-gray-50/50'
                        }`}
                      >
                        <CreditCard size={24} />
                        <div>
                          <p className="text-sm font-bold">Debit Card</p>
                          <p className="text-[10px] text-gray-400">Pay via Debit Card</p>
                        </div>
                      </button>
                    </div>

                    {/* Credit/Debit Card Interactive Form */}
                    {(paymentMethod === 'Credit Card' || paymentMethod === 'Debit Card') && (
                      <div className="mt-6 border-t border-gray-150 pt-6 dark:border-slate-800 space-y-6 animate-fade-in text-left">
                        <div className="flex flex-col md:flex-row gap-6 items-center">
                          {/* Live Mockup Card */}
                          <div className="w-full md:w-fit flex justify-center shrink-0">
                            <div className="relative h-40 w-64 rounded-2xl bg-gradient-to-br from-amber-600 via-primary-750 to-slate-900 p-5 text-white shadow-xl flex flex-col justify-between overflow-hidden">
                              <div className="flex items-start justify-between">
                                <div className="h-8 w-11 rounded bg-white/20 backdrop-blur border border-white/20 flex items-center justify-center font-mono text-[9px] text-white/80">
                                  CHIP
                                </div>
                                <span className="text-xs font-black italic tracking-widest text-white/90">
                                  {cardType.toUpperCase()}
                                </span>
                              </div>
                              
                              <div className="font-mono text-base tracking-widest my-2 text-center">
                                {cardNumber || '•••• •••• •••• ••••'}
                              </div>
                              
                              <div className="flex justify-between items-end text-left">
                                <div className="max-w-[150px]">
                                  <p className="text-[7px] uppercase tracking-widest text-white/60">Card Holder</p>
                                  <p className="font-bold text-[10px] uppercase truncate">{cardHolder || 'FULL NAME'}</p>
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="text-[7px] uppercase tracking-widest text-white/60">Expires</p>
                                  <p className="font-mono font-bold text-[10px]">{cardExpiry || 'MM/YY'}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Dynamic Feedback Details */}
                          <div className="flex-1 text-xs text-gray-500 dark:text-slate-400 space-y-1">
                            <p className="font-bold text-gray-800 dark:text-slate-200 text-sm">Interactive Payment Simulation</p>
                            <p>Fill in card details to verify responsive validations and auto-formatting.</p>
                            <p className="text-[10px] text-primary-600 dark:text-primary-400 font-semibold">&middot; Formats card numbers and expiry dates dynamically.</p>
                            <p className="text-[10px] text-primary-600 dark:text-primary-400 font-semibold">&middot; Validates CVV lengths and checks if the expiry is in the past.</p>
                            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">&middot; Actual card digits are never stored in the database.</p>
                          </div>
                        </div>

                        {/* Form Fields Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          {/* Cardholder Name */}
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                              Cardholder Name
                            </label>
                            <input
                              type="text"
                              value={cardHolder}
                              onChange={(e) => setCardHolder(e.target.value)}
                              placeholder="Enter your name"
                              className="rounded-xl border border-gray-300 px-3 py-2.5 outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                            />
                            {cardErrors.cardHolder && (
                              <span className="text-[10px] text-red-500 font-semibold">{cardErrors.cardHolder}</span>
                            )}
                          </div>

                          {/* Card Type */}
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                              Card Type
                            </label>
                            <select
                              value={cardType}
                              onChange={(e) => setCardType(e.target.value)}
                              className="rounded-xl border border-gray-300 px-3 py-2.5 outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                            >
                              <option value="Visa">Visa</option>
                              <option value="MasterCard">MasterCard</option>
                              <option value="RuPay">RuPay</option>
                              <option value="American Express">American Express</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                          {/* Card Number */}
                          <div className="sm:col-span-2 flex flex-col gap-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                              Card Number
                            </label>
                            <input
                              type="text"
                              value={cardNumber}
                              onChange={handleCardNumberChange}
                              placeholder="e.g. 4532 1234 5678 9012"
                              className="rounded-xl border border-gray-300 px-3 py-2.5 outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                            />
                            {cardErrors.cardNumber && (
                              <span className="text-[10px] text-red-500 font-semibold">{cardErrors.cardNumber}</span>
                            )}
                          </div>

                          {/* Expiry and CVV Row */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 text-center">
                                Expiry (MM/YY)
                              </label>
                              <input
                                type="text"
                                value={cardExpiry}
                                onChange={handleCardExpiryChange}
                                placeholder="MM/YY"
                                className="rounded-xl border border-gray-300 px-3 py-2.5 outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 text-center"
                              />
                              {cardErrors.cardExpiry && (
                                <span className="text-[10px] text-red-500 font-semibold">{cardErrors.cardExpiry}</span>
                              )}
                            </div>

                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 text-center">
                                CVV
                              </label>
                              <input
                                type="password"
                                value={cardCvv}
                                onChange={handleCardCvvChange}
                                placeholder="123"
                                className="rounded-xl border border-gray-300 px-3 py-2.5 outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 text-center"
                              />
                              {cardErrors.cardCvv && (
                                <span className="text-[10px] text-red-500 font-semibold">{cardErrors.cardCvv}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Review Items */}
                  <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-slate-850 dark:bg-slate-900">
                    <h2 className="text-lg font-bold text-gray-950 dark:text-slate-50 flex items-center gap-2">
                      <ShoppingBag size={20} className="text-primary-600" /> Review Order Items
                    </h2>

                    <div className="mt-4 divide-y divide-gray-150 dark:divide-slate-800">
                      {items.map((item) => (
                        <div key={`${item.product._id}-${item.size}`} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                          <img
                            src={item.product.images[0]}
                            alt=""
                            className="aspect-[3/4] w-12 rounded-lg object-cover bg-gray-50"
                          />
                          <div className="flex-1">
                            <h4 className="text-xs font-bold text-gray-800 dark:text-slate-200 line-clamp-1">
                              {item.product.name}
                            </h4>
                            <p className="text-[10px] text-gray-400">
                              Size: {item.size} &middot; Qty: {item.quantity}
                            </p>
                          </div>
                          <span className="text-xs font-bold text-gray-900 dark:text-slate-100">
                            ₹{Math.round(item.price * item.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 rounded-xl border border-gray-250 py-3 text-sm font-semibold tracking-wider text-gray-700 hover:bg-gray-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800/40"
                    >
                      BACK TO ADDRESS
                    </button>
                    <button
                      type="submit"
                      className="flex-1 rounded-xl bg-slate-900 py-3 text-sm font-semibold tracking-wider text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                    >
                      PLACE ORDER (₹{Math.round(totalBillAmount).toLocaleString('en-IN')})
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Billing Column */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-slate-850 dark:bg-slate-900 h-fit">
              <h3 className="text-sm font-bold text-gray-950 dark:text-slate-50 border-b border-gray-100 pb-3 dark:border-slate-800">
                Billing Summary
              </h3>

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between text-gray-500 dark:text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-800 dark:text-slate-200">
                    ₹{Math.round(totalPrice).toLocaleString('en-IN')}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Discount</span>
                    <span className="font-semibold">
                      -₹{Math.round(discountAmount).toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-gray-500 dark:text-slate-400">
                  <span>Shipping</span>
                  <span className="font-semibold text-gray-800 dark:text-slate-200">
                    {shippingFee === 0 ? 'FREE' : `₹${shippingFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="border-t border-gray-100 pt-3 dark:border-slate-800 flex justify-between text-base font-extrabold text-gray-950 dark:text-slate-50">
                  <span>Total Amount</span>
                  <span>
                    ₹{Math.round(totalBillAmount).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default Checkout;
