import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [coupon, setCoupon] = useState(null);

  const fetchCart = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await api.get('/api/cart');
      setCart(data);
    } catch (error) {
      console.error('Failed to load cart:', error.customMessage || error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch cart automatically when user changes (logs in/out)
  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart(null);
      setCoupon(null);
    }
  }, [user]);

  const addToCart = async (productId, size, quantity) => {
    if (!user) throw new Error('Please login to add items to cart');
    setLoading(true);
    try {
      const { data } = await api.post('/api/cart/add', { productId, size, quantity });
      setCart(data);
      return data;
    } catch (error) {
      const errMsg = error.customMessage || 'Failed to add item to cart';
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (productId, size, quantity) => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await api.put('/api/cart/update', { productId, size, quantity });
      setCart(data);
      return data;
    } catch (error) {
      const errMsg = error.customMessage || 'Failed to update item quantity';
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId, size) => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await api.delete('/api/cart/remove', {
        data: { productId, size }
      });
      setCart(data);
      return data;
    } catch (error) {
      const errMsg = error.customMessage || 'Failed to remove item from cart';
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const applyCoupon = async (code) => {
    if (!user) throw new Error('Please login to apply coupon');
    try {
      const { data } = await api.post('/api/coupons/validate', { code });
      setCoupon(data);
      return data;
    } catch (error) {
      const errMsg = error.customMessage || 'Invalid coupon code';
      throw new Error(errMsg);
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  const clearCartLocally = () => {
    setCart({
      user: user?._id,
      items: [],
      totalPrice: 0,
    });
    setCoupon(null);
  };

  // Computations
  const cartCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;
  
  const subtotal = cart?.totalPrice || 0;
  
  let discountAmount = 0;
  if (coupon && subtotal > 0) {
    if (coupon.discountType === 'percentage') {
      discountAmount = subtotal * (coupon.discountAmount / 100);
    } else if (coupon.discountType === 'fixed') {
      discountAmount = coupon.discountAmount;
    }
    discountAmount = Math.min(discountAmount, subtotal);
  }

  const finalPrice = Math.max(0, subtotal - discountAmount);

  const value = {
    cart,
    loading,
    coupon,
    fetchCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    applyCoupon,
    removeCoupon,
    clearCartLocally,
    cartCount,
    discountAmount: Math.round(discountAmount * 100) / 100,
    finalPrice: Math.round(finalPrice * 100) / 100,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
