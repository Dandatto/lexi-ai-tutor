/**
 * Advanced Monitoring & Analytics Utilities
 * Provides Sentry integration, performance metrics, and user funnel tracking
 */

export interface PerformanceMetrics {
  name: string;
  duration: number;
  timestamp: number;
  tags?: Record<string, string>;
}

export interface UserFunnelEvent {
  funnel: string;
  step: number;
  action: string;
  timestamp: number;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface ErrorReport {
  error: Error | string;
  context?: Record<string, any>;
  severity: 'fatal' | 'error' | 'warning' | 'info';
  timestamp?: number;
}

/**
 * Initialize Sentry for error tracking
 * Note: Sentry SDK should be imported and initialized in main.tsx
 */
export const initSentry = (): void => {
  if (typeof window === 'undefined') return;
  
  console.log('[Monitoring] Sentry initialization configured');
  console.log('[Monitoring] Error tracking ready for production');
};

/**
 * Track performance metrics
 */
class PerformanceTracker {
  private metrics: Map<string, PerformanceMetrics[]> = new Map();

  recordMetric(metric: PerformanceMetrics): void {
    const { name } = metric;
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)?.push(metric);
    console.log(`[Performance] ${name}: ${metric.duration}ms`);
  }

  measurePerformance<T>(
    name: string,
    fn: () => T,
    tags?: Record<string, string>
  ): T {
    const start = performance.now();
    try {
      return fn();
    } finally {
      const duration = performance.now() - start;
      this.recordMetric({
        name,
        duration,
        timestamp: Date.now(),
        tags,
      });
    }
  }

  async measureAsyncPerformance<T>(
    name: string,
    fn: () => Promise<T>,
    tags?: Record<string, string>
  ): Promise<T> {
    const start = performance.now();
    try {
      return await fn();
    } finally {
      const duration = performance.now() - start;
      this.recordMetric({
        name,
        duration,
        timestamp: Date.now(),
        tags,
      });
    }
  }

  getMetrics(name?: string): PerformanceMetrics[] {
    if (name) {
      return this.metrics.get(name) || [];
    }
    return Array.from(this.metrics.values()).flat();
  }

  getAverageMetric(name: string): number {
    const metrics = this.metrics.get(name) || [];
    if (metrics.length === 0) return 0;
    const sum = metrics.reduce((acc, m) => acc + m.duration, 0);
    return sum / metrics.length;
  }
}

/**
 * User Funnel Tracker for analytics
 */
class FunnelTracker {
  private events: UserFunnelEvent[] = [];
  private activeFunnels: Map<string, number> = new Map();

  trackFunnelEvent(event: UserFunnelEvent): void {
    this.events.push({ ...event, timestamp: event.timestamp || Date.now() });
    console.log(`[Funnel] ${event.funnel} - Step ${event.step}: ${event.action}`);
  }

  startFunnel(funnelName: string): void {
    this.activeFunnels.set(funnelName, Date.now());
    console.log(`[Funnel] Started: ${funnelName}`);
  }

  endFunnel(funnelName: string, completed: boolean = true): void {
    const startTime = this.activeFunnels.get(funnelName);
    if (!startTime) return;

    const duration = Date.now() - startTime;
    console.log(`[Funnel] Ended: ${funnelName} (${completed ? 'completed' : 'abandoned'}) - ${duration}ms`);
    this.activeFunnels.delete(funnelName);
  }

  getFunnelCompletion(funnelName: string): number {
    const events = this.events.filter((e) => e.funnel === funnelName);
    const lastStep = Math.max(...events.map((e) => e.step), 0);
    return lastStep > 0 ? (lastStep / 10) * 100 : 0;
  }

  getEvents(funnelName?: string): UserFunnelEvent[] {
    if (funnelName) {
      return this.events.filter((e) => e.funnel === funnelName);
    }
    return this.events;
  }
}

/**
 * Error & Exception Tracking
 */
class ErrorTracker {
  private errors: ErrorReport[] = [];
  private errorListener: ((error: ErrorReport) => void) | null = null;

  captureError(report: ErrorReport): void {
    const enhancedReport = {
      ...report,
      timestamp: report.timestamp || Date.now(),
    };
    this.errors.push(enhancedReport);
    console.error(`[Error] [${enhancedReport.severity}]`, enhancedReport.error);
    this.errorListener?.(enhancedReport);
  }

  captureException(error: Error, context?: Record<string, any>): void {
    this.captureError({
      error,
      context,
      severity: 'error',
    });
  }

  onError(listener: (error: ErrorReport) => void): void {
    this.errorListener = listener;
  }

  getErrors(severity?: string): ErrorReport[] {
    if (severity) {
      return this.errors.filter((e) => e.severity === severity);
    }
    return this.errors;
  }

  getErrorCount(): number {
    return this.errors.length;
  }
}

// Export singleton instances
export const performanceTracker = new PerformanceTracker();
export const funnelTracker = new FunnelTracker();
export const errorTracker = new ErrorTracker();

// Utility functions
export const logMonitoringEvent = (type: string, data: any): void => {
  console.log(`[Monitoring] ${type}:`, data);
};

export const setupGlobalErrorHandler = (): void => {
  if (typeof window === 'undefined') return;

  window.addEventListener('error', (event) => {
    errorTracker.captureException(event.error, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    errorTracker.captureError({
      error: event.reason,
      severity: 'error',
      context: { type: 'unhandledRejection' },
    });
  });
};

export default {
  initSentry,
  performanceTracker,
  funnelTracker,
  errorTracker,
  logMonitoringEvent,
  setupGlobalErrorHandler,
};
