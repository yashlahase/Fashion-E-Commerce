import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { register: signUp } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setApiError('');
    setLoading(true);
    try {
      await signUp(data.name, data.email, data.password);
      navigate('/');
    } catch (err) {
      setApiError(err.message || 'Registration failed. Try a different email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-gray-100 bg-white p-8 shadow-xl shadow-gray-200/30 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none animate-fade-in">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-slate-50">
            Create Account
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
            Create an account to track orders and save wishlists.
          </p>
        </div>

        {apiError && (
          <div className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-600 dark:bg-red-950/20 dark:text-red-400">
            {apiError}
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              {...register('name', { required: 'Full name is required' })}
              className="rounded-xl border border-gray-350 bg-gray-50/20 px-4 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:bg-white dark:border-slate-850 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-primary-400"
            />
            {errors.name && (
              <span className="text-[11px] font-semibold text-red-500">
                {errors.name.message}
              </span>
            )}
          </div>

          {/* Email Address */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register('email', {
                required: 'Email address is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
              className="rounded-xl border border-gray-350 bg-gray-50/20 px-4 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:bg-white dark:border-slate-850 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-primary-400"
            />
            {errors.email && (
              <span className="text-[11px] font-semibold text-red-500">
                {errors.email.message}
              </span>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5 relative">
            <label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
                className="w-full rounded-xl border border-gray-350 bg-gray-50/20 px-4 py-2.5 pr-10 text-sm outline-none transition focus:border-primary-500 focus:bg-white dark:border-slate-850 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-primary-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-350"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <span className="text-[11px] font-semibold text-red-500">
                {errors.password.message}
              </span>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 py-3 text-sm font-semibold tracking-wider text-white shadow-md hover:bg-slate-850 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            CREATE ACCOUNT
          </button>
        </form>

        <div className="text-center text-xs text-gray-500 dark:text-slate-450 mt-4 border-t border-gray-100 pt-4 dark:border-slate-850">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-primary-600 hover:underline dark:text-primary-450">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
