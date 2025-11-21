import React, { Component, ReactNode } from 'react';
import { trackEvent } from '../firebaseConfig';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Log error to analytics
    trackEvent('app_error', {
      errorMessage: error.toString(),
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });

    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '20px',
          margin: '20px',
          border: '2px solid #ff6b6b',
          borderRadius: '8px',
          backgroundColor: '#ffe0e0',
          color: '#c92a2a',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}>
          <h2>Oops! Something went wrong</h2>
          <p>We're sorry for the inconvenience. The error has been logged and our team will investigate.</p>
          <details style={{
            marginTop: '10px',
            padding: '10px',
            backgroundColor: '#fff3cd',
            borderRadius: '4px',
            color: '#333',
          }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Error details</summary>
            {this.state.error && <p>{this.state.error.toString()}</p>}
            {this.state.errorInfo && (
              <pre style={{
                fontSize: '12px',
                overflow: 'auto',
                backgroundColor: '#f5f5f5',
                padding: '10px',
                borderRadius: '4px',
              }}>
                {this.state.errorInfo.componentStack}
              </pre>
            )}
          </details>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '15px',
              padding: '10px 20px',
              backgroundColor: '#ff6b6b',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
