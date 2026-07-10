import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Products from '../pages/Products';
import ProductDetails from '../pages/ProductDetails';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Wishlist from '../pages/Wishlist';
import Cart from '../pages/Cart';
import Checkout from '../pages/Checkout';
import Orders from '../pages/Orders';
import OrderDetails from '../pages/OrderDetails';
import Profile from '../pages/Profile';
import Dashboard from '../pages/Admin/Dashboard';
import ProductManage from '../pages/Admin/ProductManage';
import CategoryManage from '../pages/Admin/CategoryManage';
import OrderManage from '../pages/Admin/OrderManage';
import UserManage from '../pages/Admin/UserManage';
import AdminRoute from '../components/Admin/AdminRoute';
import ProtectedRoute from './ProtectedRoute';
import Navbar from '../layouts/Navbar';
import Footer from '../layouts/Footer';

const AppRoutes = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected user routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id" element={<OrderDetails />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Admin routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/products" element={<ProductManage />} />
            <Route path="/admin/categories" element={<CategoryManage />} />
            <Route path="/admin/orders" element={<OrderManage />} />
            <Route path="/admin/users" element={<UserManage />} />
          </Route>
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default AppRoutes;
