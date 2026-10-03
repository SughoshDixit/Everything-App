/**
 * Lightweight Mobile Performance Observability
 * Instruments key performance metrics without logging private coordinates,
 * tokens, or sensitive health data.
 */

interface PerformanceMetric {
  name: string;
  durationMs: number;
  metadata?: Record<string, string | number | boolean>;
  timestamp: number;
}

class PerformanceMonitoringService {
  private marks: Map<string, number> = new Map();
  private metricsBuffer: PerformanceMetric[] = [];
  private maxBufferSize = 50;

  /**
   * Starts a timing mark.
   */
  public start(markName: string): void {
    if (typeof performance !== 'undefined' && performance.now) {
      this.marks.set(markName, performance.now());
    } else {
      this.marks.set(markName, Date.now());
    }
  }

  /**
   * Ends a timing mark and logs duration if above budget.
   */
  public end(markName: string, metadata?: Record<string, string | number | boolean>): number {
    const startTime = this.marks.get(markName);
    if (startTime === undefined) return 0;
    this.marks.delete(markName);

    const now = typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
    const durationMs = Math.round((now - startTime) * 100) / 100;

    const metric: PerformanceMetric = {
      name: markName,
      durationMs,
      metadata,
      timestamp: Date.now()
    };

    this.metricsBuffer.push(metric);
    if (this.metricsBuffer.length > this.maxBufferSize) {
      this.metricsBuffer.shift();
    }

    const isDev = typeof import.meta !== 'undefined' && Boolean(import.meta.env?.DEV);
    if (isDev || durationMs > 500) {
      // Log budget warnings for slow operations (>500ms)
      if (durationMs > 500) {
        console.warn(`[Perf Warning] ${markName} took ${durationMs}ms`, metadata || '');
      }
    }

    return durationMs;
  }

  /**
   * Retrieves recent buffered performance metrics.
   */
  public getMetrics(): PerformanceMetric[] {
    return [...this.metricsBuffer];
  }
}

export const PerfMonitor = new PerformanceMonitoringService();
