import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import RatingStars from '../components/RatingStars';
import Loader from '../components/ui/Loader';
import ProductCard from '../components/ProductCard';
import { Heart, ShoppingBag, Check, Star } from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selector states
  const [activeImage, setActiveImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [qty, setQty] = useState(1);

  // Review submission state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [addingToCartState, setAddingToCartState] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Fetch product data
  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/api/products/${id}`);
        setProduct(data);
        setActiveImage(data.images[0]);
        if (data.sizes && data.sizes.length > 0) {
          setSelectedSize(data.sizes[0]);
        }
        if (data.colors && data.colors.length > 0) {
          setSelectedColor(data.colors[0]);
        }

        // Fetch product reviews
        const revRes = await api.get(`/api/reviews/product/${id}`);
        setReviews(revRes.data);

        // Fetch similar products in same category
        const simRes = await api.get(`/api/products?category=${data.category._id}&limit=4`);
        // Filter out current product
        setSimilarProducts(simRes.data.products.filter((p) => p._id !== id));

        // Fetch wishlist IDs if logged in
        if (localStorage.getItem('token')) {
          const wishRes = await api.get('/api/wishlist');
          const ids = wishRes.data.map((p) => p._id);
          setWishlistIds(ids);
          setIsWishlisted(ids.includes(id));
        }
      } catch (err) {
        console.error('Failed to load product details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id, user]);

  const handleWishlistToggle = async () => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }

    try {
      if (isWishlisted) {
        await api.delete(`/api/wishlist/${id}`);
        setIsWishlisted(false);
      } else {
        await api.post('/api/wishlist', { productId: id });
        setIsWishlisted(true);
      }
    } catch (err) {
      console.error('Wishlist toggle error:', err);
    }
  };

  const handleAddToCartSubmit = async () => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }

    setAddingToCartState(true);
    try {
      await addToCart(product._id, selectedSize, qty);
    } catch (err) {
      alert(err.message || 'Failed to add item to cart');
    } finally {
      setAddingToCartState(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess(false);

    if (!reviewComment.trim()) {
      setReviewError('Please write a review comment');
      return;
    }

    try {
      const { data } = await api.post('/api/reviews', {
        productId: id,
        rating: reviewRating,
        comment: reviewComment,
      });

      setReviews((prev) => [
        {
          ...data,
          user: { name: user.name },
        },
        ...prev,
      ]);
      setReviewComment('');
      setReviewSuccess(true);
      
      // Update local rating summary
      const newReviews = [...reviews, data];
      const avg = newReviews.reduce((sum, r) => sum + r.rating, 0) / newReviews.length;
      setProduct((prev) => ({
        ...prev,
        rating: Math.round(avg * 10) / 10,
        totalReviews: newReviews.length,
      }));
    } catch (err) {
      setReviewError(err.customMessage || 'You already reviewed this product');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader size="large" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <h2 className="text-xl font-bold">Product Not Found</h2>
        <Link to="/products" className="mt-4 inline-block text-primary-600">
          Back to Catalog
        </Link>
      </div>
    );
  }

  const hasDiscount = product.discountPrice && product.discountPrice > 0;
  const displayPrice = hasDiscount ? product.discountPrice : product.price;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Product Card Top Grid */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Left Column: Image Gallery */}
        <div className="flex flex-col gap-4">
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 dark:border-slate-800 dark:bg-slate-850 aspect-[3/4]">
            <img
              src={activeImage}
              alt={product.name}
              className="h-full w-full object-cover object-center"
            />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`relative aspect-square w-20 shrink-0 overflow-hidden rounded-lg border bg-gray-50 dark:bg-slate-800 ${
                    activeImage === img
                      ? 'border-primary-500 ring-2 ring-primary-500/20'
                      : 'border-gray-200 dark:border-slate-800'
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Configurations */}
        <div className="flex flex-col">
          <span className="text-xs font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400">
            {product.brand}
          </span>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-gray-950 dark:text-slate-50 sm:text-3xl">
            {product.name}
          </h1>

          {/* Rating Header */}
          <div className="mt-4 flex items-center gap-2">
            <RatingStars rating={product.rating} size={16} />
            <span className="text-sm font-bold text-gray-900 dark:text-slate-200">
              {product.rating}
            </span>
            <span className="text-sm text-gray-400 dark:text-slate-500">|</span>
            <span className="text-sm font-semibold text-gray-600 dark:text-slate-400">
              {product.totalReviews} Customer Reviews
            </span>
          </div>

          {/* Price Tag */}
          <div className="mt-6 flex items-baseline gap-3 border-t border-gray-100 pt-6 dark:border-slate-800">
            <span className="text-2xl font-black text-gray-950 dark:text-slate-50">
              ₹{Math.round(displayPrice).toLocaleString('en-IN')}
            </span>
            {hasDiscount && (
              <>
                <span className="text-sm text-gray-400 line-through dark:text-slate-500">
                  ₹{Math.round(product.price).toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-bold text-red-500">
                  ({Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF)
                </span>
              </>
            )}
          </div>

          {/* Description */}
          <div className="mt-6">
            <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100">Description</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-slate-400 leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="mt-6 border-t border-gray-150 pt-6 dark:border-slate-800 space-y-6">
            {/* Color Select */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100">Color</h3>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {product.colors.map((col) => (
                    <button
                      key={col}
                      onClick={() => setSelectedColor(col)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                        selectedColor === col
                          ? 'border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300 dark:border-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Select */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100">Select Size</h3>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {product.sizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                        selectedSize === sz
                          ? 'border-primary-600 bg-primary-600 text-white dark:border-primary-500 dark:bg-primary-500'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300 dark:border-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            {product.stock > 0 && (
              <div className="flex items-center gap-4">
                <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100">Quantity</h3>
                <div className="flex items-center rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="px-3 py-1 font-bold text-gray-600 dark:text-slate-400"
                  >
                    -
                  </button>
                  <span className="px-3 text-sm font-semibold text-gray-800 dark:text-slate-100">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                    className="px-3 py-1 font-bold text-gray-600 dark:text-slate-400"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-gray-400">
                  ({product.stock} items remaining)
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {product.stock > 0 ? (
              <button
                onClick={handleAddToCartSubmit}
                disabled={addingToCartState}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
              >
                <ShoppingBag size={18} /> {addingToCartState ? 'Adding...' : 'Add To Cart'}
              </button>
            ) : (
              <button
                disabled
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-200 px-6 py-3.5 text-sm font-semibold text-gray-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-600"
              >
                Out of Stock
              </button>
            )}

            <button
              onClick={handleWishlistToggle}
              className={`flex items-center justify-center gap-2 rounded-xl border px-6 py-3.5 text-sm font-semibold transition ${
                isWishlisted
                  ? 'border-red-200 bg-red-50 text-red-600 dark:border-red-950/20 dark:bg-red-950/20 dark:text-red-400'
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-slate-800 dark:text-slate-350 dark:hover:bg-slate-800/40'
              }`}
            >
              <Heart size={18} className={isWishlisted ? 'fill-red-500 text-red-500' : ''} />
              {isWishlisted ? 'Wishlisted' : 'Wishlist'}
            </button>
          </div>
        </div>
      </div>

      {/* Product Reviews & Rating Submissions */}
      <section className="mt-16 border-t border-gray-150 pt-16 dark:border-slate-800">
        <h2 className="text-xl font-bold text-gray-950 dark:text-slate-50">
          Customer Ratings & Reviews
        </h2>

        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Rating Summary column */}
          <div className="rounded-2xl border border-gray-150 p-6 dark:border-slate-850 dark:bg-slate-900">
            <h3 className="text-base font-bold text-gray-950 dark:text-slate-100">Overall Rating</h3>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-gray-950 dark:text-slate-50">{product.rating}</span>
              <span className="text-sm text-gray-400">/ 5</span>
            </div>
            <RatingStars rating={product.rating} size={20} className="mt-2" />
            <p className="mt-4 text-xs text-gray-500 dark:text-slate-400">
              Computed from {product.totalReviews} customer reviews. Only verified shoppers can rate items.
            </p>
          </div>

          {/* List of Reviews column */}
          <div className="md:col-span-2 space-y-6">
            {reviews.length > 0 ? (
              <div className="divide-y divide-gray-150 dark:divide-slate-800 max-h-[450px] overflow-y-auto pr-2">
                {reviews.map((rev) => (
                  <div key={rev._id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-900 dark:text-slate-100">
                        {rev.user.name}
                      </span>
                      <span className="text-xs text-gray-450 dark:text-slate-500">
                        {new Date(rev.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <RatingStars rating={rev.rating} size={14} className="mt-1" />
                    <p className="mt-2.5 text-sm text-gray-600 dark:text-slate-400">
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 border border-dashed border-gray-200 rounded-xl dark:border-slate-800">
                <p className="text-sm text-gray-400">No reviews yet for this product. Be the first to share your thoughts!</p>
              </div>
            )}

            {/* Write a Review Panel */}
            {localStorage.getItem('token') ? (
              <form onSubmit={handleReviewSubmit} className="rounded-2xl border border-gray-150 p-6 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
                <h3 className="text-sm font-bold text-gray-950 dark:text-slate-100">Write a Review</h3>

                {reviewError && (
                  <div className="mt-3 rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-600 dark:bg-red-950/20 dark:text-red-400">
                    {reviewError}
                  </div>
                )}
                {reviewSuccess && (
                  <div className="mt-3 rounded-lg bg-green-50 p-3 text-xs font-semibold text-green-600 dark:bg-green-950/20 dark:text-green-400">
                    Review submitted successfully!
                  </div>
                )}

                <div className="mt-4 flex items-center gap-2">
                  <label className="text-xs font-semibold text-gray-500">Rating:</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((stars) => (
                      <button
                        key={stars}
                        type="button"
                        onClick={() => setReviewRating(stars)}
                        className="text-amber-400 focus:outline-none"
                      >
                        <Star
                          size={18}
                          className={reviewRating >= stars ? 'fill-amber-400' : 'text-gray-300 dark:text-slate-700'}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <textarea
                    rows="3"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Describe your experience with this product..."
                    className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-slate-850 dark:text-slate-100"
                  />
                </div>

                <button
                  type="submit"
                  className="mt-4 rounded-lg bg-slate-950 px-4 py-2 text-xs font-semibold tracking-wider text-white hover:bg-slate-850 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                >
                  SUBMIT REVIEW
                </button>
              </form>
            ) : (
              <div className="rounded-xl bg-gray-50 p-4 text-center dark:bg-slate-900/40 text-xs text-gray-500">
                Please <Link to="/login" className="font-semibold text-primary-600 hover:underline">sign in</Link> to submit your review comment.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <section className="mt-16 border-t border-gray-150 pt-16 dark:border-slate-800">
          <h2 className="text-xl font-bold text-gray-950 dark:text-slate-50">
            Similar Products
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4">
            {similarProducts.map((p) => (
              <ProductCard
                key={p._id}
                product={p}
                isWishlisted={wishlistIds.includes(p._id)}
                onWishlistToggle={handleWishlistToggle}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetails;
