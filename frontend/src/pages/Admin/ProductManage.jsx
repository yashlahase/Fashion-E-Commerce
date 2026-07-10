import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import Loader from '../../components/ui/Loader';
import { Plus, Edit, Trash2, X, Image } from 'lucide-react';

const ProductManage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal toggles
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null); // holds product when editing

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/products?limit=100'); // Load bulk items for management
      setProducts(data.products);
      const catRes = await api.get('/api/categories');
      setCategories(catRes.data);
    } catch (err) {
      console.error('Failed to load products list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openCreateModal = () => {
    setEditProduct(null);
    reset({
      name: '',
      brand: '',
      category: '',
      price: '',
      discountPrice: 0,
      stock: '',
      images: '',
      sizes: 'M,L,XL',
      colors: 'Black,White',
      description: '',
      featured: false,
    });
    setModalOpen(true);
  };

  const openEditModal = (prod) => {
    setEditProduct(prod);
    reset({
      name: prod.name,
      brand: prod.brand,
      category: prod.category?._id || prod.category,
      price: prod.price,
      discountPrice: prod.discountPrice || 0,
      stock: prod.stock,
      images: prod.images.join(', '),
      sizes: prod.sizes.join(','),
      colors: prod.colors.join(','),
      description: prod.description,
      featured: prod.featured,
    });
    setModalOpen(true);
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/api/products/${id}`);
        setProducts((prev) => prev.filter((p) => p._id !== id));
        alert('Product deleted successfully');
      } catch (err) {
        alert(err.customMessage || 'Deletion failed');
      }
    }
  };

  const onSubmit = async (formData) => {
    try {
      const formattedData = {
        ...formData,
        price: Number(formData.price),
        discountPrice: Number(formData.discountPrice || 0),
        stock: Number(formData.stock),
        images: formData.images.split(',').map((img) => img.trim()).filter(Boolean),
        sizes: formData.sizes.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean),
        colors: formData.colors.split(',').map((c) => c.trim()).filter(Boolean),
        featured: !!formData.featured,
      };

      if (editProduct) {
        // Update product
        const { data } = await api.put(`/api/products/${editProduct._id}`, formattedData);
        setProducts((prev) =>
          prev.map((p) => (p._id === editProduct._id ? { ...data, category: categories.find(c => c._id === data.category) } : p))
        );
        alert('Product updated successfully');
      } else {
        // Create product
        const { data } = await api.post('/api/products', formattedData);
        setProducts((prev) => [
          { ...data, category: categories.find(c => c._id === data.category) },
          ...prev
        ]);
        alert('Product created successfully');
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
      {/* Admin Dashboard Navigation */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-150 pb-4 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-slate-50">
            Product Management
          </h1>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            Create, update, and manage catalog items.
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
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white dark:bg-slate-100 dark:text-slate-900"
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

      {/* Control Action Top Bar */}
      <div className="flex justify-end">
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-primary-500 shadow-md"
        >
          <Plus size={16} /> ADD PRODUCT
        </button>
      </div>

      {/* Products Table list */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-slate-850 dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-150 text-xs font-bold text-gray-400 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-850/30">
                <th className="p-4">Item</th>
                <th className="p-4">Brand</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-850 text-xs text-gray-700 dark:text-slate-350">
              {products.map((prod) => (
                <tr key={prod._id} className="hover:bg-gray-50/30 dark:hover:bg-slate-800/10">
                  <td className="p-4 flex items-center gap-3">
                    <img
                      src={prod.images[0]}
                      alt=""
                      className="aspect-[3/4] w-9 rounded object-cover bg-gray-50"
                    />
                    <span className="font-semibold text-gray-900 dark:text-slate-100 line-clamp-1 max-w-[200px]">
                      {prod.name}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-primary-600 dark:text-primary-400 uppercase">
                    {prod.brand}
                  </td>
                  <td className="p-4">
                    {prod.category?.name || 'N/A'}
                  </td>
                  <td className="p-4 font-extrabold text-gray-900 dark:text-slate-50">
                    ${prod.price.toFixed(2)}
                  </td>
                  <td className="p-4">
                    <span className={prod.stock === 0 ? 'text-red-500 font-bold' : ''}>
                      {prod.stock} units
                    </span>
                  </td>
                  <td className="p-4 text-right flex justify-end gap-2.5">
                    <button
                      onClick={() => openEditModal(prod)}
                      className="text-gray-500 hover:text-primary-600"
                      aria-label="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(prod._id)}
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

      {/* Modal CRUD Form */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-gray-250 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-slate-800">
              <h2 className="text-lg font-bold text-gray-950 dark:text-slate-50">
                {editProduct ? 'Edit Catalog Product' : 'Create New Product'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Product Name */}
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-gray-500">Product Name</label>
                  <input
                    type="text"
                    {...register('name', { required: 'Name is required' })}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-xs outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-slate-850 dark:text-slate-100"
                  />
                  {errors.name && <span className="text-[10px] text-red-500">{errors.name.message}</span>}
                </div>

                {/* Brand */}
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-gray-500">Brand</label>
                  <input
                    type="text"
                    {...register('brand', { required: 'Brand is required' })}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-xs outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-slate-850 dark:text-slate-100"
                  />
                  {errors.brand && <span className="text-[10px] text-red-500">{errors.brand.message}</span>}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Category select */}
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-gray-500">Category</label>
                  <select
                    {...register('category', { required: 'Category is required' })}
                    className="rounded-lg border border-gray-350 bg-white px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-850 dark:text-slate-100"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {errors.category && <span className="text-[10px] text-red-500">{errors.category.message}</span>}
                </div>

                {/* Stock */}
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-gray-500">Stock Inventory Units</label>
                  <input
                    type="number"
                    {...register('stock', { required: 'Stock is required' })}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-xs outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-slate-850 dark:text-slate-100"
                  />
                  {errors.stock && <span className="text-[10px] text-red-500">{errors.stock.message}</span>}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Price */}
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-gray-500">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('price', { required: 'Price is required' })}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-xs outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-slate-850 dark:text-slate-100"
                  />
                  {errors.price && <span className="text-[10px] text-red-500">{errors.price.message}</span>}
                </div>

                {/* Discount Price */}
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-gray-500">Discount Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('discountPrice')}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-xs outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-slate-850 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Images URL (comma separated) */}
              <div className="flex flex-col gap-1">
                <label className="font-bold text-gray-500 flex items-center gap-1">
                  <Image size={13} /> Product Image URLs (comma-separated list)
                </label>
                <textarea
                  rows="2"
                  placeholder="https://image1.com, https://image2.com"
                  {...register('images', { required: 'At least one image URL is required' })}
                  className="rounded-lg border border-gray-300 p-3 text-xs outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-slate-850 dark:text-slate-100"
                />
                {errors.images && <span className="text-[10px] text-red-500">{errors.images.message}</span>}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Sizes comma separated */}
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-gray-500">Sizes (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. S, M, L, XL"
                    {...register('sizes')}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-xs outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-slate-850 dark:text-slate-100"
                  />
                </div>

                {/* Colors comma separated */}
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-gray-500">Colors (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Black, White, Navy"
                    {...register('colors')}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-xs outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-slate-850 dark:text-slate-100"
                  />
                </div>
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

              {/* Featured Checkbox */}
              <div>
                <label className="flex items-center gap-2 font-bold text-gray-700 dark:text-slate-350 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('featured')}
                    className="rounded text-primary-600 focus:ring-primary-500 h-4 w-4"
                  />
                  Featured Product (promotes on homepage)
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2.5 border-t border-gray-100 pt-3 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-gray-250 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50 dark:border-slate-800 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-800 dark:bg-slate-105 dark:text-slate-900 dark:hover:bg-slate-200"
                >
                  {editProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManage;
