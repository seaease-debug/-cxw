import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width,
  height,
  borderRadius = '0.75rem', // Default to matches project's rounded-xl / radius-card
}) => {
  const style: React.CSSProperties = {
    borderRadius,
    ...(width !== undefined ? { width } : {}),
    ...(height !== undefined ? { height } : {}),
  };

  return (
    <div
      className={`animate-shimmer bg-slate-100 dark:bg-slate-800/60 ${className}`}
      style={style}
    />
  );
};

interface SkeletonCircleProps {
  className?: string;
  size?: number | string;
}

export const SkeletonCircle: React.FC<SkeletonCircleProps> = ({
  className = '',
  size = 40,
}) => {
  return (
    <Skeleton
      className={className}
      width={size}
      height={size}
      borderRadius="9999px" // Matches radius-pill
    />
  );
};

interface SkeletonTextProps {
  className?: string;
  rows?: number;
  gap?: string;
  lastRowWidth?: string;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  className = '',
  rows = 3,
  gap = '0.5rem',
  lastRowWidth = '60%',
}) => {
  return (
    <div className={`flex flex-col ${className}`} style={{ gap }}>
      {Array.from({ length: rows }).map((_, index) => {
        const isLast = index === rows - 1;
        return (
          <Skeleton
            key={index}
            height="0.875rem"
            width={isLast && rows > 1 ? lastRowWidth : '100%'}
            borderRadius="0.375rem"
          />
        );
      })}
    </div>
  );
};
