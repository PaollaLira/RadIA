import React from 'react';

interface RadiaBrandIconProps {
  className?: string;
}

export const RadiaBrandIcon: React.FC<RadiaBrandIconProps> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Top-left modular cross arm */}
    <path
      d="M5.2 10H10V5.2"
      stroke="#FFFFFF"
      strokeWidth="2.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Top-right modular cross arm (AI cyan accent) */}
    <path
      d="M14 5.2V10H18.8"
      stroke="#38BDF8"
      strokeWidth="2.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Bottom-left modular cross arm */}
    <path
      d="M5.2 14H10V18.8"
      stroke="#FFFFFF"
      strokeWidth="2.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Bottom-right modular cross arm */}
    <path
      d="M14 18.8V14H18.8"
      stroke="#FFFFFF"
      strokeWidth="2.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
