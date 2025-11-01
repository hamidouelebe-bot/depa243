
import React, { useState } from 'react';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  isInteractive?: boolean;
}

const Star: React.FC<{
  filled: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  className: string;
}> = ({ filled, onClick, onMouseEnter, onMouseLeave, className }) => (
  <svg
    onClick={onClick}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    className={`${className} ${filled ? 'text-yellow-400' : 'text-gray-300'}`}
    fill="currentColor"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const StarRating: React.FC<StarRatingProps> = ({ rating, onRatingChange, size = 'md', isInteractive = false }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const starElements = [];
  for (let i = 1; i <= 5; i++) {
    const isFilled = isInteractive
      ? i <= (hoverRating || rating)
      : i <= rating;

    starElements.push(
      <Star
        key={i}
        filled={isFilled}
        onClick={isInteractive && onRatingChange ? () => onRatingChange(i) : undefined}
        onMouseEnter={isInteractive ? () => setHoverRating(i) : undefined}
        onMouseLeave={isInteractive ? () => setHoverRating(0) : undefined}
        className={`${sizeClasses[size]} ${isInteractive ? 'cursor-pointer' : ''}`}
      />
    );
  }

  return <div className="flex items-center">{starElements}</div>;
};

export default StarRating;
