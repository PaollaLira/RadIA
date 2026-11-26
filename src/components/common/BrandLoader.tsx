import React from 'react';

interface BrandLoaderProps {
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CLASSES: Record<NonNullable<BrandLoaderProps['size']>, string> = {
  sm: 'w-5 h-5 rounded-md',
  md: 'w-10 h-10 rounded-xl',
  lg: 'w-14 h-14 rounded-2xl',
};

export const BrandLoader: React.FC<BrandLoaderProps> = ({ size = 'sm' }) => {
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden bg-[#09142B] ring-2 ring-cyan-400/50 animate-pulse ${SIZE_CLASSES[size]}`}
      aria-hidden="true"
    >
      <img
        src="/assets/ultrai-med-icon.jfif"
        alt=""
        className="w-full h-full object-cover scale-[1.12]"
      />
    </span>
  );
};
