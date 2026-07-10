import React from 'react';
import { Star, StarHalf } from 'lucide-react';

const RatingStars = ({ rating = 0, size = 16, className = '' }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.4; // Show half star if rating decimal is 0.4 or higher

  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      stars.push(
        <Star
          key={i}
          size={size}
          className="fill-amber-400 text-amber-400"
        />
      );
    } else if (i === fullStars + 1 && hasHalf) {
      stars.push(
        <StarHalf
          key={i}
          size={size}
          className="fill-amber-400 text-amber-400"
        />
      );
    } else {
      stars.push(
        <Star
          key={i}
          size={size}
          className="text-gray-300 dark:text-slate-600"
        />
      );
    }
  }

  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {stars}
    </div>
  );
};

export default RatingStars;
