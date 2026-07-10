import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Loader from '../../components/ui/Loader';
import { DollarSign, ShoppingBag, Users, Layers, TrendingUp, ChevronRight } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        // Load stats
        const { data } = await api.get('/api/orders/dashboard/stats');
        setStats(data);

        // Load recent orders (admin all orders, slice top 5)
        const orderRes = await api.get('/api/orders/all');
        setRecentOrders(orderRes.data.slice(0, 5));
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader size="large" />
      </div>
    );
  }

  const { metrics, categorySales, monthlySales } = stats || {};

  // Custom SVG render helpers for charts
  const maxCategorySales = categorySales?.length > 0
    ? Math.max(...categorySales.map((c) => c.revenue))
    : 1;

  const maxMonthlySales = monthlySales?.length > 0
    ? Math.max(...monthlySales.map((m) => m.revenue))
    : 1;

  // Month names helper
  const getMonthName = (monthNum) => {
    const dates = new Date(2026, monthNum - 1, 1);
    return dates.toLocaleString('default', { month: 'short' });
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      {/* Dashboard Top Header & Admin Navigation tabs */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-150 pb-4 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-slate-50">
            Control Console
          </h1>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            Store metrics and configuration settings.
          </p>
        </div>

        {/* Tab links */}
        <div className="flex flex-wrap gap-2">
          <Link
            to="/admin/dashboard"
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white dark:bg-slate-100 dark:text-slate-900"
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
            className="rounded-lg border border-gray-250 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 dark:border-slate-800 dark:text-slate-350 dark:hover:bg-slate-800/40"
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

      {/* 1. Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Revenue */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-slate-850 dark:bg-slate-900 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 dark:text-slate-500">
              Total Revenue
            </span>
            <h3 className="mt-1 text-xl font-black text-gray-900 dark:text-slate-50">
              ${metrics?.totalRevenue.toFixed(2)}
            </h3>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-400">
            <DollarSign size={20} />
          </div>
        </div>

        {/* Orders */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-slate-850 dark:bg-slate-900 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 dark:text-slate-500">
              Total Orders
            </span>
            <h3 className="mt-1 text-xl font-black text-gray-900 dark:text-slate-50">
              {metrics?.totalOrders}
            </h3>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400">
            <ShoppingBag size={20} />
          </div>
        </div>

        {/* Users */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-slate-850 dark:bg-slate-900 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 dark:text-slate-500">
              Total Customers
            </span>
            <h3 className="mt-1 text-xl font-black text-gray-900 dark:text-slate-50">
              {metrics?.totalUsers}
            </h3>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400">
            <Users size={20} />
          </div>
        </div>

        {/* Products */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-slate-850 dark:bg-slate-900 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 dark:text-slate-500">
              Active Products
            </span>
            <h3 className="mt-1 text-xl font-black text-gray-900 dark:text-slate-50">
              {metrics?.totalProducts}
            </h3>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400">
            <Layers size={20} />
          </div>
        </div>
      </div>

      {/* 2. Charts Section (Responsive Custom SVG charts) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Category Sales revenue */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-slate-850 dark:bg-slate-900">
          <h3 className="text-sm font-bold text-gray-950 dark:text-slate-50 border-b border-gray-100 pb-3 dark:border-slate-800">
            Revenue by Category
          </h3>
          <div className="mt-6 flex flex-col gap-4">
            {categorySales?.length > 0 ? (
              categorySales.map((cat) => {
                const widthPercent = Math.max(5, Math.round((cat.revenue / maxCategorySales) * 100));
                return (
                  <div key={cat._id} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-gray-700 dark:text-slate-350">{cat._id}</span>
                      <span className="text-gray-950 dark:text-slate-50">${cat.revenue.toFixed(2)}</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        style={{ width: `${widthPercent}%` }}
                        className="h-full rounded-full bg-gradient-to-r from-primary-500 to-indigo-500"
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-gray-400 text-center py-8">No category metrics loaded.</p>
            )}
          </div>
        </div>

        {/* Monthly Sales Trend Line/Bar chart */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-slate-850 dark:bg-slate-900">
          <h3 className="text-sm font-bold text-gray-950 dark:text-slate-50 border-b border-gray-100 pb-3 dark:border-slate-800 flex items-center gap-1.5">
            <TrendingUp size={16} /> Monthly Revenue Trend
          </h3>
          <div className="mt-6 flex items-end justify-between gap-2 h-44 px-2 pt-4">
            {monthlySales?.length > 0 ? (
              monthlySales.map((m, idx) => {
                const heightPercent = Math.max(8, Math.round((m.revenue / maxMonthlySales) * 100));
                return (
                  <div key={idx} className="flex flex-col items-center gap-2 flex-1 group">
                    <div className="relative w-full flex justify-center">
                      {/* Tooltip */}
                      <span className="absolute -top-7 scale-0 group-hover:scale-100 transition bg-slate-950 text-white dark:bg-slate-100 dark:text-slate-950 text-[9px] font-bold px-2 py-0.5 rounded shadow-md z-10 whitespace-nowrap">
                        ${m.revenue.toFixed(0)}
                      </span>
                      <div
                        style={{ height: `${heightPercent}px` }}
                        className="w-8 rounded-t bg-gradient-to-t from-primary-600 to-primary-400 dark:from-primary-500 dark:to-indigo-500 hover:opacity-85"
                      />
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 dark:text-slate-400">
                      {getMonthName(m._id.month)}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-gray-450 text-center py-8 w-full">No monthly sales recorded.</p>
            )}
          </div>
        </div>
      </div>

      {/* 3. Recent Orders List */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-slate-850 dark:bg-slate-900">
        <h3 className="text-sm font-bold text-gray-950 dark:text-slate-50 border-b border-gray-100 pb-3 dark:border-slate-800">
          Recent Orders
        </h3>

        {recentOrders.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 dark:border-slate-800">
                  <th className="pb-3 pr-2">ID</th>
                  <th className="pb-3 pr-2">Date</th>
                  <th className="pb-3 pr-2">Customer</th>
                  <th className="pb-3 pr-2">Method</th>
                  <th className="pb-3 pr-2">Bill</th>
                  <th className="pb-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-850 text-xs text-gray-700 dark:text-slate-350">
                {recentOrders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/20">
                    <td className="py-3.5 pr-2 font-bold text-gray-900 dark:text-slate-200">
                      #{ord._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="py-3.5 pr-2">
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 pr-2">
                      {ord.user?.name}
                    </td>
                    <td className="py-3.5 pr-2">
                      {ord.paymentMethod}
                    </td>
                    <td className="py-3.5 pr-2 font-extrabold text-gray-950 dark:text-slate-50">
                      ${ord.totalAmount.toFixed(2)}
                    </td>
                    <td className="py-3.5 text-right">
                      <Link
                        to={`/orders/${ord._id}`}
                        className="inline-flex items-center gap-1 font-bold text-primary-600 hover:text-primary-500"
                      >
                        View <ChevronRight size={12} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-gray-450 py-6 text-center">No orders registered on the platform.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
