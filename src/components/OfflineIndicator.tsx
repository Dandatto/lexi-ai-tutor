import React, { useState, useEffect } from 'react';

interface OfflineIndicatorProps {
  showLabel?: boolean;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ showLabel = true }) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('[OfflineIndicator] Connection restored');
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('[OfflineIndicator] Connection lost');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) {
    return null;
  }

  return (
    <div className="offline-indicator-container">
      <div className="offline-indicator">
        <div className="offline-icon">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        {showLabel && (
          <span className="offline-text">Bạn đang offline</span>
        )}
      </div>
      <style>{`
        .offline-indicator-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 9999;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          padding: 12px 16px;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
          animation: slideDown 0.3s ease-out forwards;
        }

        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .offline-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          max-width: 1280px;
          margin: 0 auto;
          color: white;
          font-weight: 500;
        }

        .offline-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .offline-icon svg {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .offline-text {
          font-size: 14px;
          letter-spacing: 0.5px;
        }

        @media (max-width: 640px) {
          .offline-indicator-container {
            padding: 10px 12px;
          }

          .offline-text {
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
};

export default OfflineIndicator;
