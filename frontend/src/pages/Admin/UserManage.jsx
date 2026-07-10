import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Loader from '../../components/ui/Loader';
import Badge from '../../components/ui/Badge';
import { Mail, Calendar, Shield } from 'lucide-react';

const UserManage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/api/auth/users');
        setUsers(data);
      } catch (err) {
        console.error('Failed to load users list:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

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
            User Ledger
          </h1>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            Browse registered client profiles and access permissions.
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
            className="rounded-lg border border-gray-250 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 dark:border-slate-800 dark:text-slate-350 dark:hover:bg-slate-800/40"
          >
            Orders
          </Link>
          <Link
            to="/admin/users"
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white dark:bg-slate-100 dark:text-slate-900"
          >
            Users
          </Link>
        </div>
      </div>

      {/* Users Table list */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-slate-850 dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-150 text-xs font-bold text-gray-400 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-850/30">
                <th className="p-4">Customer</th>
                <th className="p-4">Email</th>
                <th className="p-4">Contact Phone</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4">Privilege Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-850 text-xs text-gray-700 dark:text-slate-350">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50/30 dark:hover:bg-slate-800/10">
                  <td className="p-4 font-bold text-gray-900 dark:text-slate-100">
                    {u.name}
                  </td>
                  <td className="p-4">
                    <span className="flex items-center gap-1">
                      <Mail size={13} className="text-gray-400" />
                      {u.email}
                    </span>
                  </td>
                  <td className="p-4">
                    {u.phone || 'N/A'}
                  </td>
                  <td className="p-4">
                    <span className="flex items-center gap-1">
                      <Calendar size={13} className="text-gray-400" />
                      {new Date(u.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="p-4">
                    <Badge variant={u.role === 'admin' ? 'danger' : 'secondary'}>
                      <span className="flex items-center gap-1 uppercase">
                        {u.role === 'admin' && <Shield size={10} />}
                        {u.role}
                      </span>
                    </Badge>
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

export default UserManage;
