import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import RatingStars from './RatingStars';

const ProductCard = ({ product, isWishlisted, onWishlistToggle }) => {
  const [hovered, setHovered] = useState(false);

  const {
    _id,
    name,
    brand,
    price,
    discountPrice,
    images,
    rating,
    totalReviews,
    sizes,
  } = product;

  const hasDiscount = discountPrice && discountPrice > 0;
  const displayPrice = hasDiscount ? discountPrice : price;
  const savings = hasDiscount ? Math.round(((price - discountPrice) / price) * 100) : 0;

  return (
    <div
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50 dark:border-slate-800 dark:bg-slate-900 dark:hover:shadow-none"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Product Image */}
      <Link to={`/products/${_id}`} className="relative block overflow-hidden aspect-[3/4] bg-gray-100 dark:bg-slate-800">
        <img
          src={images[hovered && images[1] ? 1 : 0] || images[0]}
          alt={name}
          className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        {hasDiscount && (
          <span className="absolute left-3 top-3 rounded-lg bg-red-500 px-2 py-1 text-xs font-bold text-white shadow-sm">
            {savings}% OFF
          </span>
        )}
      </Link>

      {/* Wishlist Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onWishlistToggle(_id);
        }}
        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition duration-250 hover:bg-white hover:scale-110 dark:bg-slate-800/90 dark:hover:bg-slate-800"
        aria-label="Toggle wishlist"
      >
        <Heart
          size={18}
          className={`transition-colors duration-200 ${
            isWishlisted
              ? 'fill-red-500 text-red-500'
              : 'text-gray-600 hover:text-red-500 dark:text-slate-400'
          }`}
        />
      </button>

      {/* Product Details */}
      <div className="flex flex-1 flex-col p-4">
        {/* Brand */}
        <span className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
          {brand}
        </span>

        {/* Title */}
        <Link to={`/products/${_id}`} className="mt-1 block">
          <h3 className="line-clamp-1 text-sm font-semibold text-gray-800 hover:text-primary-600 dark:text-slate-100 dark:hover:text-primary-400">
            {name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="mt-1.5 flex items-center gap-1">
          <RatingStars rating={rating} size={13} />
          {totalReviews > 0 && (
            <span className="text-[11px] text-gray-400 dark:text-slate-500">
              ({totalReviews})
            </span>
          )}
        </div>

        {/* Sizes */}
        <div className="mt-2.5 flex flex-wrap gap-1">
          {sizes.slice(0, 4).map((sz) => (
            <span
              key={sz}
              className="rounded border border-gray-150 px-1.5 py-0.5 text-[9px] font-semibold text-gray-500 dark:border-slate-800 dark:text-slate-400"
            >
              {sz}
            </span>
          ))}
          {sizes.length > 4 && (
            <span className="text-[9px] font-bold text-gray-400 self-center">
              +{sizes.length - 4}
            </span>
          )}
        </div>

        {/* Price Tag */}
        <div className="mt-auto pt-3 flex items-baseline gap-2">
          <span className="text-base font-extrabold text-gray-900 dark:text-slate-50">
            ₹{Math.round(displayPrice).toLocaleString('en-IN')}
          </span>
          {hasDiscount && (
            <span className="text-xs text-gray-450 line-through dark:text-slate-500">
              ₹{Math.round(price).toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
