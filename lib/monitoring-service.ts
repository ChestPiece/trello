interface RequestLog {
  id: string;
  ip: string;
  method: string;
  url: string;
  userAgent?: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  statusCode?: number;
  error?: string;
  toolCalls?: Array<{
    toolName: string;
    duration: number;
    success: boolean;
    error?: string;
  }>;
}

interface MonitoringMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  errorRate: number;
  toolCallStats: Record<
    string,
    {
      count: number;
      averageDuration: number;
      successRate: number;
    }
  >;
  recentErrors: Array<{
    timestamp: number;
    error: string;
    ip: string;
  }>;
}

export class MonitoringService {
  private requests: Map<string, RequestLog> = new Map();
  private readonly maxRequests: number = 1000;
  private readonly maxErrors: number = 100;
  private recentErrors: Array<{
    timestamp: number;
    error: string;
    ip: string;
  }> = [];

  /**
   * Start logging a request
   */
  startRequest(
    id: string,
    ip: string,
    method: string,
    url: string,
    userAgent?: string
  ): void {
    const requestLog: RequestLog = {
      id,
      ip,
      method,
      url,
      userAgent,
      startTime: Date.now(),
    };

    this.requests.set(id, requestLog);

    // Clean up old requests if we exceed max
    if (this.requests.size > this.maxRequests) {
      const oldestKey = this.requests.keys().next().value;
      if (oldestKey) {
        this.requests.delete(oldestKey);
      }
    }

    console.log(`[MONITORING] Request started: ${method} ${url} from ${ip}`);
  }

  /**
   * End logging a request
   */
  endRequest(
    id: string,
    statusCode: number,
    error?: string,
    toolCalls?: Array<{
      toolName: string;
      duration: number;
      success: boolean;
      error?: string;
    }>
  ): void {
    const requestLog = this.requests.get(id);
    if (!requestLog) {
      console.warn(`[MONITORING] Request ${id} not found`);
      return;
    }

    const endTime = Date.now();
    const duration = endTime - requestLog.startTime;

    requestLog.endTime = endTime;
    requestLog.duration = duration;
    requestLog.statusCode = statusCode;
    requestLog.error = error;
    requestLog.toolCalls = toolCalls;

    // Log error if present
    if (error) {
      this.logError(error, requestLog.ip);
      console.error(
        `[MONITORING] Request failed: ${requestLog.method} ${requestLog.url} - ${error} (${duration}ms)`
      );
    } else {
      console.log(
        `[MONITORING] Request completed: ${requestLog.method} ${requestLog.url} - ${statusCode} (${duration}ms)`
      );
    }

    // Log tool calls if present
    if (toolCalls && toolCalls.length > 0) {
      toolCalls.forEach((toolCall) => {
        const status = toolCall.success ? "success" : "failed";
        console.log(
          `[MONITORING] Tool call: ${toolCall.toolName} - ${status} (${toolCall.duration}ms)`
        );
      });
    }
  }

  /**
   * Log a tool execution
   */
  logToolExecution(
    requestId: string,
    toolName: string,
    duration: number,
    success: boolean,
    error?: string
  ): void {
    const requestLog = this.requests.get(requestId);
    if (!requestLog) return;

    if (!requestLog.toolCalls) {
      requestLog.toolCalls = [];
    }

    requestLog.toolCalls.push({
      toolName,
      duration,
      success,
      error,
    });
  }

  /**
   * Log an error
   */
  private logError(error: string, ip: string): void {
    const errorEntry = {
      timestamp: Date.now(),
      error,
      ip,
    };

    this.recentErrors.push(errorEntry);

    // Keep only recent errors
    if (this.recentErrors.length > this.maxErrors) {
      this.recentErrors = this.recentErrors.slice(-this.maxErrors);
    }
  }

  /**
   * Get monitoring metrics
   */
  getMetrics(): MonitoringMetrics {
    const requests = Array.from(this.requests.values());
    const completedRequests = requests.filter((r) => r.endTime !== undefined);

    const totalRequests = completedRequests.length;
    const successfulRequests = completedRequests.filter(
      (r) => r.statusCode && r.statusCode < 400
    ).length;
    const failedRequests = totalRequests - successfulRequests;

    const averageResponseTime =
      completedRequests.length > 0
        ? completedRequests.reduce((sum, r) => sum + (r.duration || 0), 0) /
          completedRequests.length
        : 0;

    const errorRate = totalRequests > 0 ? failedRequests / totalRequests : 0;

    // Calculate tool call statistics
    const toolCallStats: Record<
      string,
      { count: number; averageDuration: number; successRate: number }
    > = {};

    completedRequests.forEach((request) => {
      if (request.toolCalls) {
        request.toolCalls.forEach((toolCall) => {
          if (!toolCallStats[toolCall.toolName]) {
            toolCallStats[toolCall.toolName] = {
              count: 0,
              averageDuration: 0,
              successRate: 0,
            };
          }

          const stats = toolCallStats[toolCall.toolName];
          stats.count++;
          stats.averageDuration =
            (stats.averageDuration * (stats.count - 1) + toolCall.duration) /
            stats.count;
        });
      }
    });

    // Calculate success rates for tools
    Object.keys(toolCallStats).forEach((toolName) => {
      const toolRequests = completedRequests
        .filter((r) => r.toolCalls?.some((tc) => tc.toolName === toolName))
        .map((r) => r.toolCalls!.filter((tc) => tc.toolName === toolName))
        .flat();

      const successfulToolCalls = toolRequests.filter(
        (tc) => tc.success
      ).length;
      toolCallStats[toolName].successRate =
        toolRequests.length > 0 ? successfulToolCalls / toolRequests.length : 0;
    });

    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      averageResponseTime,
      errorRate,
      toolCallStats,
      recentErrors: this.recentErrors.slice(-10), // Last 10 errors
    };
  }

  /**
   * Get request logs for debugging
   */
  getRequestLogs(limit: number = 50): RequestLog[] {
    return Array.from(this.requests.values())
      .sort((a, b) => b.startTime - a.startTime)
      .slice(0, limit);
  }

  /**
   * Clear all monitoring data
   */
  clear(): void {
    this.requests.clear();
    this.recentErrors = [];
  }

  /**
   * Generate a unique request ID
   */
  generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton instance
export const monitoringService = new MonitoringService();
