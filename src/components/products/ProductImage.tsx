// src/components/products/ProductImage.tsx
'use client';

// --- React ---
import React from 'react';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
}

const ProductImage: React.FC<ProductImageProps> = ({ src, alt, className }) => {
  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = 'https://placehold.co/200x200/117ace/ffffff?text=FilaMeter';
    e.currentTarget.onerror = null;
  };

  return <img src={src} alt={alt} className={className} onError={handleError} />;
};

export default ProductImage;
