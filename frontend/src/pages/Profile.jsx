import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { User, Key, Save, Loader2 } from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      address: user?.address || '',
      password: '',
      confirmPassword: '',
    },
  });

  // Keep fields in sync with user context load
  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }
    if (user) {
      setValue('name', user.name || '');
      setValue('phone', user.phone || '');
      setValue('address', user.address || '');
    }
  }, [user, setValue, navigate]);

  const onSubmit = async (data) => {
    setErrorMsg('');
    setSuccessMsg('');

    if (data.password && data.password !== data.confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const updateData = {
        name: data.name,
        phone: data.phone,
        address: data.address,
      };

      if (data.password) {
        updateData.password = data.password;
      }

      await updateProfile(updateData);
      setSuccessMsg('Profile updated successfully!');
      setValue('password', '');
      setValue('confirmPassword', '');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="border-b border-gray-150 pb-4 dark:border-slate-800">
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-slate-50">
          Account Settings
        </h1>
        <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
          Manage your personal details, contact numbers, and password keys.
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-gray-250 bg-white p-6 dark:border-slate-850 dark:bg-slate-900 shadow-xl shadow-gray-250/20 dark:shadow-none animate-fade-in">
        {errorMsg && (
          <div className="mb-4 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-600 dark:bg-red-950/20 dark:text-red-400">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 rounded-xl bg-green-50 p-4 text-sm font-semibold text-green-600 dark:bg-green-950/20 dark:text-green-400">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-slate-200 border-b border-gray-100 pb-2 dark:border-slate-800">
            <User size={16} /> Personal Information
          </div>

          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              {...register('name', { required: 'Name is required' })}
              className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
            {errors.name && (
              <span className="text-[10px] text-red-500">{errors.name.message}</span>
            )}
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              {...register('phone')}
              className="rounded-xl border border-gray-350 px-4 py-2.5 text-sm outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Address */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="address" className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
              Default Shipping Address
            </label>
            <textarea
              id="address"
              rows="2"
              {...register('address')}
              className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="pt-4 flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-slate-200 border-b border-gray-100 pb-2 dark:border-slate-800">
            <Key size={16} /> Security Password Key
          </div>

          {/* Password Reset fields */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                New Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Leave blank to keep current"
                {...register('password', {
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
                className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
              {errors.password && (
                <span className="text-[10px] text-red-500">{errors.password.message}</span>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirm password"
                {...register('confirmPassword')}
                className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold tracking-wider text-white shadow-md hover:bg-slate-850 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            SAVE CHANGES
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
