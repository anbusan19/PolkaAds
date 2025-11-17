//! PolkaAds Ad Display UI Component
//! React component for displaying ads in the wallet extension

import React, { useState, useEffect } from 'react';

interface AdDisplayProps {
  ad: {
    adId: number;
    name: string;
    description: string;
    videoUrl: string;
    advertiser: string;
  };
  onComplete: () => void;
  onSkip?: () => void;
  minDuration?: number; // Minimum viewing duration in milliseconds
}

export const AdDisplay: React.FC<AdDisplayProps> = ({
  ad,
  onComplete,
  onSkip,
  minDuration = 5000, // 5 seconds default
}) => {
  const [viewTime, setViewTime] = useState(0);
  const [canComplete, setCanComplete] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setViewTime((prev) => {
        const newTime = prev + 100;
        if (newTime >= minDuration) {
          setCanComplete(true);
        }
        return newTime;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [minDuration]);

  const handleVideoEnd = () => {
    setVideoEnded(true);
    if (viewTime >= minDuration) {
      setCanComplete(true);
    }
  };

  const handleComplete = () => {
    if (canComplete) {
      onComplete();
    }
  };

  const progress = Math.min((viewTime / minDuration) * 100, 100);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.branding}>
          <span style={styles.brandText}>PolkaAds</span>
          <span style={styles.sponsoredText}>Sponsored Transaction</span>
        </div>
        {onSkip && (
          <button style={styles.skipButton} onClick={onSkip}>
            Skip
          </button>
        )}
      </div>

      <div style={styles.content}>
        <div style={styles.adInfo}>
          <h3 style={styles.adTitle}>{ad.name}</h3>
          <p style={styles.adDescription}>{ad.description}</p>
          <p style={styles.advertiser}>By: {ad.advertiser.slice(0, 10)}...</p>
        </div>

        <div style={styles.videoContainer}>
          <video
            src={ad.videoUrl}
            controls
            autoPlay
            muted
            onEnded={handleVideoEnd}
            onError={() => setError('Failed to load video')}
            style={styles.video}
          />
          {error && <div style={styles.error}>{error}</div>}
        </div>

        <div style={styles.progressContainer}>
          <div style={styles.progressBar}>
            <div
              style={{
                ...styles.progressFill,
                width: `${progress}%`,
              }}
            />
          </div>
          <p style={styles.progressText}>
            {canComplete
              ? 'Click "Complete" to proceed with sponsored transaction'
              : `Watch for ${Math.ceil((minDuration - viewTime) / 1000)}s more to continue`}
          </p>
        </div>
      </div>

      <div style={styles.footer}>
        <button
          style={{
            ...styles.completeButton,
            opacity: canComplete ? 1 : 0.5,
            cursor: canComplete ? 'pointer' : 'not-allowed',
          }}
          onClick={handleComplete}
          disabled={!canComplete}
        >
          {canComplete ? 'Complete & Continue' : 'Please watch the ad'}
        </button>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    width: '100%',
    maxWidth: '500px',
    margin: '0 auto',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #e9ecef',
  },
  branding: {
    display: 'flex',
    flexDirection: 'column',
  },
  brandText: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#E6007A',
  },
  sponsoredText: {
    fontSize: '12px',
    color: '#6c757d',
    marginTop: '2px',
  },
  skipButton: {
    padding: '6px 12px',
    backgroundColor: 'transparent',
    border: '1px solid #dee2e6',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#6c757d',
  },
  content: {
    padding: '20px',
  },
  adInfo: {
    marginBottom: '16px',
  },
  adTitle: {
    fontSize: '20px',
    fontWeight: '600',
    margin: '0 0 8px 0',
    color: '#212529',
  },
  adDescription: {
    fontSize: '14px',
    color: '#6c757d',
    margin: '0 0 8px 0',
    lineHeight: '1.5',
  },
  advertiser: {
    fontSize: '12px',
    color: '#adb5bd',
    margin: 0,
  },
  videoContainer: {
    position: 'relative',
    width: '100%',
    marginBottom: '16px',
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: 'auto',
    display: 'block',
  },
  error: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color: '#dc3545',
    fontSize: '14px',
  },
  progressContainer: {
    marginBottom: '16px',
  },
  progressBar: {
    width: '100%',
    height: '8px',
    backgroundColor: '#e9ecef',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '8px',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#E6007A',
    transition: 'width 0.1s linear',
  },
  progressText: {
    fontSize: '12px',
    color: '#6c757d',
    margin: 0,
    textAlign: 'center',
  },
  footer: {
    padding: '16px 20px',
    backgroundColor: '#f8f9fa',
    borderTop: '1px solid #e9ecef',
  },
  completeButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#E6007A',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
};


