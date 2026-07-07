import { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import React from 'react';

export default function StarRating({
  rating = 0,
  setRating,
  readOnly = false,
  size = 24
}) {
  const [hover, setHover] = useState(null);
  const activeRating = hover?? rating;

  const handleClick = (value) => {
    if (!readOnly && setRating) setRating(value);
  };

  const handleKeyDown = (e, value) => {
    if (readOnly) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(value);
    }
  };

  return (
    <div
      role={readOnly? 'img' : 'radiogroup'}
      aria-label={`Rating: ${rating} out of 5 stars`}
      className="flex gap-1"
    >
      {[...Array(5)].map((_, i) => {
        const ratingValue = i + 1;
        const filled = ratingValue <= activeRating;

        return (
          <button
            key={i}
            type="button"
            role={readOnly? undefined : 'radio'}
            aria-checked={rating === ratingValue}
            aria-label={`${ratingValue} star${ratingValue > 1? 's' : ''}`}
            tabIndex={readOnly? -1 : 0}
            disabled={readOnly}
            onClick={() => handleClick(ratingValue)}
            onMouseEnter={() =>!readOnly && setHover(ratingValue)}
            onMouseLeave={() =>!readOnly && setHover(null)}
            onFocus={() =>!readOnly && setHover(ratingValue)}
            onBlur={() =>!readOnly && setHover(null)}
            onKeyDown={(e) => handleKeyDown(e, ratingValue)}
            className={`
              transition-transform duration-150
              ${!readOnly? 'cursor-pointer hover:scale-110 focus:outline-none focus:ring-2 focus:ring-amber-400 rounded' : 'cursor-default'}
              ${filled? 'text-amber-400' : 'text-gray-300'}
            `}
            style={{ fontSize: `${size}px`, lineHeight: 1 }}
          >
            <FaStar />
          </button>
        );
      })}
      {readOnly && <span className="sr-only">{rating} out of 5 stars</span>}
    </div>
  );
}