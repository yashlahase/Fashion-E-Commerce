import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import Loader from '../../components/ui/Loader';
import { Plus, Edit, Trash2, X, Image } from 'lucide-react';

const CategoryManage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal toggles
  const [modalOpen, setModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/categories');
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditCategory(null);
    reset({
      name: '',
      description: '',
      image: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditCategory(cat);
    reset({
      name: cat.name,
      description: cat.description,
      image: cat.image,
    });
    setModalOpen(true);
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Deleting this category will unlink existing products. Proceed?')) {
      try {
        await api.delete(`/api/categories/${id}`);
        setCategories((prev) => prev.filter((c) => c._id !== id));
        alert('Category removed successfully');
      } catch (err) {
        alert(err.customMessage || 'Deletion failed');
      }
    }
  };

  const onSubmit = async (formData) => {
    try {
      if (editCategory) {
        // Update
        const { data } = await api.put(`/api/categories/${editCategory._id}`, formData);
        setCategories((prev) =>
          prev.map((c) => (c._id === editCategory._id ? data : c))
        );
        alert('Category updated successfully');
      } else {
        // Create
        const { data } = await api.post('/api/categories', formData);
        setCategories((prev) => [...prev, data]);
        alert('Category created successfully');
      }
      setModalOpen(false);
    } catch (err) {
      alert(err.customMessage || 'Operation failed');
    }
  };

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
            Category Management
          </h1>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            Create, update, and manage store categories.
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
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white dark:bg-slate-100 dark:text-slate-900"
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

      <div className="flex justify-end">
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-primary-500 shadow-md"
        >
          <Plus size={16} /> ADD CATEGORY
        </button>
      </div>

      {/* Categories Table list */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-slate-850 dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-150 text-xs font-bold text-gray-400 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-850/30">
                <th className="p-4">Category</th>
                <th className="p-4">Description</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-850 text-xs text-gray-700 dark:text-slate-350">
              {categories.map((cat) => (
                <tr key={cat._id} className="hover:bg-gray-50/30 dark:hover:bg-slate-800/10">
                  <td className="p-4 flex items-center gap-3">
                    <img
                      src={cat.image}
                      alt=""
                      className="aspect-square w-9 rounded object-cover bg-gray-50"
                    />
                    <span className="font-bold text-gray-900 dark:text-slate-100">
                      {cat.name}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500 dark:text-slate-400 max-w-sm line-clamp-1">
                    {cat.description}
                  </td>
                  <td className="p-4 text-right flex justify-end gap-2.5">
                    <button
                      onClick={() => openEditModal(cat)}
                      className="text-gray-500 hover:text-primary-600"
                      aria-label="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat._id)}
                      className="text-gray-500 hover:text-red-500"
                      aria-label="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-gray-250 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-fade-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-slate-800">
              <h2 className="text-base font-bold text-gray-950 dark:text-slate-50">
                {editCategory ? 'Edit Category' : 'Create Category'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4 text-xs">
              {/* Category Name */}
              <div className="flex flex-col gap-1">
                <label className="font-bold text-gray-500">Category Name</label>
                <input
                  type="text"
                  {...register('name', { required: 'Name is required' })}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-xs outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-slate-850 dark:text-slate-100"
                />
                {errors.name && <span className="text-[10px] text-red-500">{errors.name.message}</span>}
              </div>

              {/* Image URL */}
              <div className="flex flex-col gap-1">
                <label className="font-bold text-gray-500 flex items-center gap-1">
                  <Image size={13} /> Image Banner URL
                </label>
                <input
                  type="text"
                  placeholder="https://image-banner.com/img.jpg"
                  {...register('image', { required: 'Image is required' })}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-xs outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-slate-850 dark:text-slate-100"
                />
                {errors.image && <span className="text-[10px] text-red-500">{errors.image.message}</span>}
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1">
                <label className="font-bold text-gray-500">Description</label>
                <textarea
                  rows="3"
                  {...register('description', { required: 'Description is required' })}
                  className="rounded-lg border border-gray-300 p-3 text-xs outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-slate-850 dark:text-slate-100"
                />
                {errors.description && <span className="text-[10px] text-red-500">{errors.description.message}</span>}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 border-t border-gray-100 pt-3 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-gray-250 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50 dark:border-slate-800 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                >
                  {editCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManage;
