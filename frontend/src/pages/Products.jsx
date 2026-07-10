import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import EmptyState from '../components/EmptyState';
import Loader from '../components/ui/Loader';
import { Search, SlidersHorizontal, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Products = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Filter local states
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [selectedCategories, setSelectedCategories] = useState(
    searchParams.get('category') ? searchParams.get('category').split(',') : []
  );
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [selectedSizes, setSelectedSizes] = useState(
    searchParams.get('size') ? searchParams.get('size').split(',') : []
  );
  const [selectedRating, setSelectedRating] = useState(searchParams.get('rating') || '');
  const [isFeatured, setIsFeatured] = useState(searchParams.get('featured') === 'true');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');

  // Load categories and wishlist IDs once
  useEffect(() => {
    const fetchInitData = async () => {
      try {
        const catRes = await api.get('/api/categories');
        setCategories(catRes.data);

        if (localStorage.getItem('token')) {
          const wishRes = await api.get('/api/wishlist');
          setWishlistIds(wishRes.data.map((p) => p._id));
        }
      } catch (err) {
        console.error('Failed to load initial data:', err);
      }
    };
    fetchInitData();
  }, [user]);

  // Load products when query params change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchParams.get('keyword')) params.append('keyword', searchParams.get('keyword'));
        if (searchParams.get('category')) params.append('category', searchParams.get('category'));
        if (searchParams.get('size')) params.append('size', searchParams.get('size'));
        if (searchParams.get('minPrice')) params.append('minPrice', searchParams.get('minPrice'));
        if (searchParams.get('maxPrice')) params.append('maxPrice', searchParams.get('maxPrice'));
        if (searchParams.get('rating')) params.append('rating', searchParams.get('rating'));
        if (searchParams.get('featured')) params.append('featured', searchParams.get('featured'));
        if (searchParams.get('sort')) params.append('sort', searchParams.get('sort'));
        params.append('page', page.toString());
        params.append('limit', '8'); // 8 items per page

        const { data } = await api.get(`/api/products?${params.toString()}`);
        setProducts(data.products);
        setTotalPages(data.pages || 1);
        setTotalProducts(data.totalProducts || 0);
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams, page]);

  // Sync state from query parameters on path change
  useEffect(() => {
    setKeyword(searchParams.get('keyword') || '');
    setSelectedCategories(searchParams.get('category') ? searchParams.get('category').split(',') : []);
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setSelectedSizes(searchParams.get('size') ? searchParams.get('size').split(',') : []);
    setSelectedRating(searchParams.get('rating') || '');
    setIsFeatured(searchParams.get('featured') === 'true');
    setSort(searchParams.get('sort') || 'newest');
    setPage(Number(searchParams.get('page')) || 1);
  }, [searchParams]);

  const updateFilters = (newParams) => {
    const nextParams = new URLSearchParams(searchParams);
    
    // Reset to page 1 on new filters
    nextParams.set('page', '1');
    setPage(1);

    Object.keys(newParams).forEach((key) => {
      const val = newParams[key];
      if (val === undefined || val === '' || (Array.isArray(val) && val.length === 0)) {
        nextParams.delete(key);
      } else if (Array.isArray(val)) {
        nextParams.set(key, val.join(','));
      } else {
        nextParams.set(key, val.toString());
      }
    });

    setSearchParams(nextParams);
  };

  const handleCategoryChange = (catId) => {
    const updated = selectedCategories.includes(catId)
      ? selectedCategories.filter((id) => id !== catId)
      : [...selectedCategories, catId];
    setSelectedCategories(updated);
    updateFilters({ category: updated });
  };

  const handleSizeChange = (sz) => {
    const updated = selectedSizes.includes(sz)
      ? selectedSizes.filter((s) => s !== sz)
      : [...selectedSizes, sz];
    setSelectedSizes(updated);
    updateFilters({ size: updated });
  };

  const handlePriceApply = (e) => {
    e.preventDefault();
    updateFilters({ minPrice, maxPrice });
  };

  const handleClearAll = () => {
    setKeyword('');
    setSelectedCategories([]);
    setMinPrice('');
    setMaxPrice('');
    setSelectedSizes([]);
    setSelectedRating('');
    setIsFeatured(false);
    setSort('newest');
    setSearchParams(new URLSearchParams());
    setPage(1);
  };

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

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '7UK', '8UK', '9UK', '10UK', 'One Size'];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* LEFT COLUMN: Filters Sidebar */}
        <aside className="w-full shrink-0 border-b border-gray-200 pb-6 lg:w-64 lg:border-b-0 lg:border-r lg:pr-8 lg:pb-0 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-slate-50">
              <SlidersHorizontal size={18} /> Filters
            </h2>
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-700 dark:text-red-400"
            >
              <Trash2 size={13} /> Clear All
            </button>
          </div>

          <div className="mt-6 space-y-6">
            {/* Category Filter */}
            <div className="border-t border-gray-200 pt-4 dark:border-slate-800">
              <h3 className="text-sm font-bold text-gray-900 dark:text-slate-200">Category</h3>
              <div className="mt-3 space-y-2">
                {categories.map((cat) => (
                  <label key={cat._id} className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat._id)}
                      onChange={() => handleCategoryChange(cat._id)}
                      className="rounded text-primary-600 focus:ring-primary-500 h-4 w-4"
                    />
                    {cat.name}
                  </label>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="border-t border-gray-200 pt-4 dark:border-slate-800">
              <h3 className="text-sm font-bold text-gray-900 dark:text-slate-200">Price Range</h3>
              <form onSubmit={handlePriceApply} className="mt-3 flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                >
                  Go
                </button>
              </form>
            </div>

            {/* Size Filter */}
            <div className="border-t border-gray-200 pt-4 dark:border-slate-800">
              <h3 className="text-sm font-bold text-gray-900 dark:text-slate-200">Size</h3>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {sizes.map((sz) => {
                  const isChecked = selectedSizes.includes(sz);
                  return (
                    <button
                      key={sz}
                      onClick={() => handleSizeChange(sz)}
                      className={`rounded-lg border px-3 py-1 text-xs font-semibold uppercase tracking-wider transition ${
                        isChecked
                          ? 'border-primary-600 bg-primary-600 text-white dark:border-primary-500 dark:bg-primary-500'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300 dark:border-slate-800 dark:text-slate-400 dark:hover:border-slate-700'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Rating Filter */}
            <div className="border-t border-gray-200 pt-4 dark:border-slate-800">
              <h3 className="text-sm font-bold text-gray-900 dark:text-slate-200">Minimum Rating</h3>
              <div className="mt-3 space-y-2">
                {[4, 3, 2, 1].map((stars) => (
                  <label key={stars} className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400 cursor-pointer">
                    <input
                      type="radio"
                      name="rating"
                      checked={selectedRating === stars.toString()}
                      onChange={() => {
                        setSelectedRating(stars.toString());
                        updateFilters({ rating: stars });
                      }}
                      className="text-primary-600 focus:ring-primary-500 h-4 w-4"
                    />
                    {stars} Stars & Up
                  </label>
                ))}
              </div>
            </div>

            {/* Featured Only Filter */}
            <div className="border-t border-gray-200 pt-4 dark:border-slate-800">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => {
                    setIsFeatured(e.target.checked);
                    updateFilters({ featured: e.target.checked ? 'true' : '' });
                  }}
                  className="rounded text-primary-600 focus:ring-primary-500 h-4 w-4"
                />
                Featured Products
              </label>
            </div>
          </div>
        </aside>

        {/* RIGHT COLUMN: Results Header & Grid */}
        <main className="flex-1">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-150 pb-4 dark:border-slate-800">
            <div>
              <h1 className="text-xl font-extrabold text-gray-900 dark:text-slate-50">
                Fashion Catalog
              </h1>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                Showing {products.length} of {totalProducts} items
              </p>
            </div>

            {/* Sorting Dropdown */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">Sort By</label>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  updateFilters({ sort: e.target.value });
                }}
                className="rounded-lg border border-gray-350 bg-white px-3 py-1.5 text-xs font-semibold outline-none focus:border-primary-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="newest">Newest</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Catalog Grid */}
          {loading ? (
            <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 p-3 bg-white dark:border-slate-850 dark:bg-slate-900">
                  <div className="skeleton rounded-xl aspect-[3/4] w-full" />
                  <div className="skeleton mt-4 h-4 w-1/3 rounded" />
                  <div className="skeleton mt-2 h-4 w-2/3 rounded" />
                  <div className="skeleton mt-3 h-5 w-1/2 rounded" />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3">
                {products.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    isWishlisted={wishlistIds.includes(product._id)}
                    onWishlistToggle={handleWishlistToggle}
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => {
                      setPage((p) => Math.max(1, p - 1));
                      const nextParams = new URLSearchParams(searchParams);
                      nextParams.set('page', (page - 1).toString());
                      setSearchParams(nextParams);
                    }}
                    className="rounded-lg border border-gray-250 px-4 py-2 text-xs font-semibold tracking-wider hover:bg-gray-150 disabled:opacity-50 dark:border-slate-800 dark:hover:bg-slate-800 dark:text-slate-300"
                  >
                    PREV
                  </button>
                  <span className="text-xs font-bold text-gray-500 dark:text-slate-400">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => {
                      setPage((p) => Math.min(totalPages, p + 1));
                      const nextParams = new URLSearchParams(searchParams);
                      nextParams.set('page', (page + 1).toString());
                      setSearchParams(nextParams);
                    }}
                    className="rounded-lg border border-gray-250 px-4 py-2 text-xs font-semibold tracking-wider hover:bg-gray-150 disabled:opacity-50 dark:border-slate-800 dark:hover:bg-slate-800 dark:text-slate-300"
                  >
                    NEXT
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="mt-12">
              <EmptyState
                icon={Search}
                title="No Products Found"
                description="We couldn't find any products matching your filters. Try clearing some selections or search for other items."
                actionText="Reset Filters"
                actionLink="/products"
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Products;
