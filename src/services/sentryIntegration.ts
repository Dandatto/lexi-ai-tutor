/**
 * Sentry Integration for Error Tracking
 * Production-ready error reporting and monitoring
 */

import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

export interface SentryConfig {
  dsn: string;
  environment: string;
  enablePerformanceMonitoring?: boolean;
  tracesSampleRate?: number;
  releaseVersion?: string;
}

const DEFAULT_CONFIG: Partial<SentryConfig> = {
  environment: process.env.NODE_ENV || 'production',
  enablePerformanceMonitoring: true,
  tracesSampleRate: 1.0,
};

/**
 * Initialize Sentry for production error tracking
 */
export const initializeSentry = (config: Partial<SentryConfig>): void => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  if (!finalConfig.dsn) {
    console.warn('[Sentry] DSN not provided. Error tracking disabled.');
    return;
  }

  Sentry.init({
    dsn: finalConfig.dsn,
    environment: finalConfig.environment,
    integrations: [
      new BrowserTracing({
        routingInstrumentation: Sentry.reactRouterV6Instrumentation(
          window.history
        ),
      }),
    ],
    tracesSampleRate: finalConfig.tracesSampleRate || 1.0,
    release: finalConfig.releaseVersion,
    beforeSend(event, hint) {
      // Filter out certain errors if needed
      if (event.exception) {
        const error = hint.originalException;
        // Example: Filter 404 errors or network errors
        if (error instanceof Error && error.message.includes('404')) {
          return null;
        }
      }
      return event;
    },
  });

  console.log('[Sentry] Error tracking initialized for', finalConfig.environment);
};

/**
 * Capture exception with context
 */
export const captureException = (
  error: Error | string,
  context?: Record<string, any>
): void => {
  if (typeof error === 'string') {
    Sentry.captureException(new Error(error), { extra: context });
  } else {
    Sentry.captureException(error, { extra: context });
  }
};

/**
 * Capture message
 */
export const captureMessage = (
  message: string,
  level: Sentry.SeverityLevel = 'info'
): void => {
  Sentry.captureMessage(message, level);
};

/**
 * Set user context for error tracking
 */
export const setUserContext = (userId: string, userEmail?: string): void => {
  Sentry.setUser({
    id: userId,
    email: userEmail,
  });
};

/**
 * Clear user context
 */
export const clearUserContext = (): void => {
  Sentry.setUser(null);
};

/**
 * Add breadcrumb for tracking user actions
 */
export const addBreadcrumb = (
  category: string,
  message: string,
  level: Sentry.SeverityLevel = 'info',
  data?: Record<string, any>
): void => {
  Sentry.addBreadcrumb({
    category,
    message,
    level,
    data,
    timestamp: Date.now() / 1000,
  });
};

/**
 * Start performance transaction
 */
export const startTransaction = (name: string, op: string): Sentry.Transaction | null => {
  if (!Sentry.isInitialized()) {
    return null;
  }
  return Sentry.startTransaction({
    name,
    op,
  });
};

/**
 * Create HTTP transaction for API calls
 */
export const createHTTPTransaction = (
  method: string,
  url: string
): Sentry.Transaction | null => {
  return startTransaction(`${method} ${url}`, 'http.request');
};

/**
 * Wrap async function with error tracking
 */
export const withErrorTracking = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  operationName: string
): T => {
  return (async (...args: any[]) => {
    const transaction = startTransaction(operationName, 'operation');
    try {
      return await fn(...args);
    } catch (error) {
      captureException(
        error as Error,
        { operation: operationName, args }
      );
      throw error;
    } finally {
      transaction?.finish();
    }
  }) as T;
};

/**
 * Setup Sentry for API error handling
 */
export const setupSentryErrorHandler = (): void => {
  // Global error handler
  window.addEventListener('error', (event) => {
    captureException(event.error, {
      type: 'global_error',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  // Unhandled promise rejection
  window.addEventListener('unhandledrejection', (event) => {
    captureException(
      event.reason,
      { type: 'unhandledRejection' }
    );
  });

  console.log('[Sentry] Global error handlers installed');
};

export default {
  initializeSentry,
  captureException,
  captureMessage,
  setUserContext,
  clearUserContext,
  addBreadcrumb,
  startTransaction,
  createHTTPTransaction,
  withErrorTracking,
  setupSentryErrorHandler,
};
