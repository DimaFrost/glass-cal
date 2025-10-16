import React, { forwardRef } from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  isDragging?: boolean;
  style?: React.CSSProperties;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(({ 
  children, 
  className = '', 
  onClick,
  isDragging = false,
  style
}, ref) => {
  return (
    <div
      ref={ref}
      className={`
        bg-white/10 border border-white/20 rounded-xl
        shadow-lg hover:shadow-xl transition-all duration-300
        ${isDragging ? 'opacity-50 scale-105' : 'hover:bg-white/15'}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      style={{
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        ...style
      }}
      onClick={onClick}
    >
      {children}
    </div>
  );
});
