import React, { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating = 0, total = 5, size = 20, editable = false, onRate }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleMouseEnter = (index) => {
    if (editable) {
      setHoverRating(index);
    }
  };

  const handleMouseLeave = () => {
    if (editable) {
      setHoverRating(0);
    }
  };

  const handleClick = (index) => {
    if (editable && onRate) {
      onRate(index);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div className="flex items-center gap-1">
      {[...Array(total)].map((_, index) => {
        const starIndex = index + 1;
        const isFilled = starIndex <= displayRating;
        const isHalfFilled = !isFilled && starIndex - 0.5 <= displayRating;

        return (
          <button
            key={index}
            type="button"
            onMouseEnter={() => handleMouseEnter(starIndex)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(starIndex)}
            className={`${editable ? 'cursor-pointer' : 'cursor-default'} focus:outline-none`}
            disabled={!editable}
          >
            <Star
              size={size}
              className={`transition-colors ${
                isFilled
                  ? 'fill-yellow-400 text-yellow-400'
                  : isHalfFilled
                  ? 'fill-yellow-400/50 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;