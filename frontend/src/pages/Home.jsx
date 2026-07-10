import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import Loader from '../components/ui/Loader';
import { ArrowRight, ShieldCheck, Truck, RefreshCw, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load home data
  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        // Load categories
        const catRes = await api.get('/api/categories');
        setCategories(catRes.data);

        // Load featured products
        const prodRes = await api.get('/api/products?featured=true&limit=8');
        setFeaturedProducts(prodRes.data.products);

        // Load wishlist IDs if logged in
        if (localStorage.getItem('token')) {
          const wishRes = await api.get('/api/wishlist');
          setWishlistIds(wishRes.data.map((p) => p._id));
        }
      } catch (err) {
        console.error('Failed to load home page data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, [user]);

  const handleWishlistToggle = async (productId) => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }

    try {
      const isCurrentlyFav = wishlistIds.includes(productId);
      if (isCurrentlyFav) {
        await api.delete(`/api/wishlist/${productId}`);
        setWishlistIds((prev) => prev.filter((id) => id !== productId));
      } else {
        await api.post('/api/wishlist', { productId });
        setWishlistIds((prev) => [...prev, productId]);
      }
    } catch (err) {
      console.error('Wishlist toggle error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader size="large" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 px-8 py-20 text-white dark:bg-slate-950 sm:px-12 md:py-32">
        <div className="absolute inset-0 z-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&auto=format&fit=crop&q=80')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/80 to-transparent z-0" />
        
        <div className="relative z-10 max-w-lg">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-500/10 px-3 py-1 text-xs font-semibold tracking-wider text-primary-400 border border-primary-500/30">
            <Sparkles size={12} /> NEW SEASON ARRIVALS
          </div>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            Redefine Your Modern Style
          </h1>
          <p className="mt-6 text-base text-gray-300 sm:text-lg">
            Discover unmatched comfort and clean silhouettes in our newest summer ready collection.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition duration-200 hover:bg-primary-500"
            >
              Shop Now <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Categories Section */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-slate-50">
            Browse Categories
          </h2>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/products?category=${cat._id}`}
              className="group relative flex aspect-square flex-col overflow-hidden rounded-2xl bg-gray-100"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="text-base font-bold sm:text-lg">{cat.name}</h3>
                <p className="mt-1 line-clamp-1 text-xs text-gray-300">
                  {cat.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Featured Products */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-slate-50">
            Featured Products
          </h2>
          <Link
            to="/products?featured=true"
            className="text-sm font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400"
          >
            See All Products &rarr;
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              isWishlisted={wishlistIds.includes(product._id)}
              onWishlistToggle={handleWishlistToggle}
            />
          ))}
        </div>
      </section>

      {/* 4. Benefits Grid */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 rounded-3xl border border-gray-100 bg-white p-8 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-3">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
              <Truck size={24} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-950 dark:text-slate-50">
                Free Delivery
              </h4>
              <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                On all orders over ₹999.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <RefreshCw size={24} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-950 dark:text-slate-50">
                Easy Return & Swap
              </h4>
              <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                Return items within 30 days of purchase with no hassles.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-950 dark:text-slate-50">
                Secure Hashed Pay
              </h4>
              <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                Fully protected checkout logs, preventing credential leaks.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
