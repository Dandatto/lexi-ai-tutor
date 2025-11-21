import React from 'react';

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ width = '100%', height = '20px', borderRadius = '4px' }) => (
  <div
    style={{
      width,
      height,
      borderRadius,
      backgroundColor: '#e0e0e0',
      animation: 'shimmer 2s infinite',
      backgroundImage: 'linear-gradient(90deg, #e0e0e0 0%, #f0f0f0 50%, #e0e0e0 100%)',
      backgroundSize: '200% 100%',
      backgroundPosition: '0 0',
    }}
  />
);

export const LoadingFallback: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '20px',
        backgroundColor: '#ffffff',
        minHeight: '100vh',
      }}
    >
      {/* Header Skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid #f0f0f0' }}>
        <Skeleton width="200px" height="32px" />
        <Skeleton width="60px" height="40px" borderRadius="8px" />
      </div>

      {/* Content Skeleton */}
      <div style={{ flex: 1 }}>
        {/* Title */}
        <Skeleton width="300px" height="28px" style={{ marginBottom: '20px' }} />

        {/* Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}>
          {[1, 2, 3, 4].map((index) => (
            <div
              key={index}
              style={{
                padding: '16px',
                border: '1px solid #f0f0f0',
                borderRadius: '8px',
              }}
            >
              <Skeleton width="100%" height="200px" style={{ marginBottom: '12px' }} />
              <Skeleton width="80%" height="16px" style={{ marginBottom: '8px' }} />
              <Skeleton width="100%" height="14px" />
            </div>
          ))}
        </div>

        {/* List Items */}
        <div>
          {[1, 2, 3].map((index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                gap: '12px',
                padding: '12px 0',
                borderBottom: '1px solid #f5f5f5',
              }}
            >
              <Skeleton width="40px" height="40px" borderRadius="50%" />
              <div style={{ flex: 1 }}>
                <Skeleton width="60%" height="16px" style={{ marginBottom: '8px' }} />
                <Skeleton width="100%" height="14px" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
};

export default LoadingFallback;
