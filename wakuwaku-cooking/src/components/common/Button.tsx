import React from 'react';
import { soundManager } from '../../utils/soundManager';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'back' | 'play';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  className = ''
}) => {
  const handleClick = () => {
    if (!disabled) {
      soundManager.play('tap');
      onClick?.();
    }
  };

  const baseStyles = `
    font-bold rounded-full
    transition-all duration-200 ease-out
    active:scale-95
    disabled:opacity-50 disabled:cursor-not-allowed
    touch-manipulation
  `;

  const variantStyles = {
    primary: `
      bg-gradient-to-br from-orange-400 to-orange-500
      text-white
      shadow-[0_6px_0_#c2410c,0_10px_20px_rgba(0,0,0,0.2)]
      active:shadow-[0_2px_0_#c2410c,0_4px_10px_rgba(0,0,0,0.2)]
      active:translate-y-1
    `,
    secondary: `
      bg-gradient-to-br from-pink-400 to-pink-500
      text-white
      shadow-[0_6px_0_#be185d,0_10px_20px_rgba(0,0,0,0.2)]
      active:shadow-[0_2px_0_#be185d,0_4px_10px_rgba(0,0,0,0.2)]
      active:translate-y-1
    `,
    back: `
      bg-gradient-to-br from-gray-300 to-gray-400
      text-gray-700
      shadow-[0_4px_0_#6b7280,0_8px_15px_rgba(0,0,0,0.15)]
      active:shadow-[0_2px_0_#6b7280,0_4px_8px_rgba(0,0,0,0.15)]
      active:translate-y-0.5
    `,
    play: `
      bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400
      text-white
      shadow-[0_8px_0_#dc2626,0_15px_30px_rgba(0,0,0,0.25)]
      active:shadow-[0_4px_0_#dc2626,0_8px_15px_rgba(0,0,0,0.25)]
      active:translate-y-1
      animate-pulse
    `
  };

  const sizeStyles = {
    small: 'px-4 py-2 text-sm min-w-[48px] min-h-[48px]',
    medium: 'px-6 py-3 text-lg min-w-[64px] min-h-[64px]',
    large: 'px-8 py-4 text-2xl min-w-[80px] min-h-[80px]'
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {children}
    </button>
  );
};
