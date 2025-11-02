import React from 'react';

const LoadingSkeleton = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
  );
};

export default LoadingSkeleton;
