import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import {
  ShoppingBag,
  Heart,
  User,
  Sun,
  Moon,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Search,
} from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      navigate(`/products?keyword=${encodeURIComponent(searchKeyword.trim())}`);
      setSearchKeyword('');
    }
  };

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200/80 bg-white/80 backdrop-blur-md transition-colors duration-200 dark:border-slate-800/80 dark:bg-slate-900/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                FASHION
              </span>
              <span className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest">
                E-COMMERCE
              </span>
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearchSubmit} className="hidden max-w-md flex-1 sm:block">
            <div className="relative">
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Search products, brands..."
                className="w-full rounded-full border border-gray-300 bg-gray-50/50 py-2 pl-4 pr-10 text-sm outline-none transition duration-150 focus:border-primary-500 focus:bg-white focus:ring-1 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-100 dark:focus:border-primary-400 dark:focus:bg-slate-800"
              />
              <button type="submit" className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300">
                <Search size={16} />
              </button>
            </div>
          </form>

          {/* Navigation Links - Desktop */}
          <div className="hidden items-center gap-6 lg:flex">
            <Link to="/" className="text-sm font-medium text-gray-700 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400">
              Home
            </Link>
            <Link to="/products" className="text-sm font-medium text-gray-700 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400">
              Shop
            </Link>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              aria-label="Wishlist"
            >
              <Heart size={20} />
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              aria-label="Shopping Cart"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white ring-2 ring-white dark:bg-primary-500 dark:ring-slate-900">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Profile Dropdown */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-1.5 rounded-full p-1.5 text-gray-700 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700 dark:bg-primary-900/60 dark:text-primary-300">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 origin-top-right rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg dark:border-slate-800 dark:bg-slate-800">
                    <div className="px-3 py-2 text-xs font-semibold border-b border-gray-100 text-gray-500 dark:border-slate-700 dark:text-slate-400">
                      Hello, {user?.name}
                    </div>
                    {isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-700/50"
                      >
                        <LayoutDashboard size={15} />
                        Admin Dashboard
                      </Link>
                    )}
                    <Link
                      to="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-700/50"
                    >
                      <User size={15} />
                      My Profile
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-700/50"
                    >
                      <ShoppingBag size={15} />
                      My Orders
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20"
                    >
                      <LogOut size={15} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 sm:block"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-full p-2 text-gray-500 hover:bg-gray-100 lg:hidden dark:text-slate-400 dark:hover:bg-slate-800"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-gray-200 bg-white py-4 lg:hidden dark:border-slate-800 dark:bg-slate-900">
          <div className="space-y-1.5 px-4">
            <form onSubmit={handleSearchSubmit} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="Search products, brands..."
                  className="w-full rounded-full border border-gray-300 bg-gray-50 py-2 pl-4 pr-10 text-sm outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
                <button type="submit" className="absolute right-3 top-2.5 text-gray-400 dark:text-slate-500">
                  <Search size={16} />
                </button>
              </div>
            </form>
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 hover:bg-gray-100 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              Home
            </Link>
            <Link
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 hover:bg-gray-100 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              Shop
            </Link>
            {!isAuthenticated && (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-4 block w-full rounded-lg bg-slate-900 py-2.5 text-center text-sm font-semibold text-white dark:bg-slate-100 dark:text-slate-900"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
