import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import EmptyState from '../components/EmptyState';
import Loader from '../components/ui/Loader';
import { Heart } from 'lucide-react';

const Wishlist = () => {
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/wishlist');
      setWishlistItems(data);
    } catch (err) {
      console.error('Failed to load wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }
    fetchWishlist();
  }, []);

  const handleWishlistToggle = async (productId) => {
    try {
      await api.delete(`/api/wishlist/${productId}`);
      // Filter out item locally
      setWishlistItems((prev) => prev.filter((item) => item._id !== productId));
    } catch (err) {
      console.error('Wishlist removal failed:', err);
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
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="border-b border-gray-150 pb-4 dark:border-slate-800">
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-slate-50">
          My Wishlist
        </h1>
        <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
          You have {wishlistItems.length} items saved in your favorites.
        </p>
      </div>

      {wishlistItems.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {wishlistItems.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              isWishlisted={true}
              onWishlistToggle={handleWishlistToggle}
            />
          ))}
        </div>
      ) : (
        <div className="mt-12">
          <EmptyState
            icon={Heart}
            title="Wishlist is Empty"
            description="Explore our collections and tap the heart icon on any product to save it here."
            actionText="Go Shopping"
            actionLink="/products"
          />
        </div>
      )}
    </div>
  );
};

export default Wishlist;
