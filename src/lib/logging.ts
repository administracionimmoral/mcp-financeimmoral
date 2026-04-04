/**
 * Structured logging utility
 * Outputs JSON logs, never includes secrets
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function getConfiguredLevel(): LogLevel {
  const level = (process.env.LOG_LEVEL || 'info') as LogLevel;
  return LOG_LEVELS[level] !== undefined ? level : 'info';
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[getConfiguredLevel()];
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  [key: string]: unknown;
}

function createLogEntry(level: LogLevel, message: string, data?: Record<string, unknown>): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...data,
  };
}

function writeLog(level: LogLevel, message: string, data?: Record<string, unknown>): void {
  if (!shouldLog(level)) return;

  const entry = createLogEntry(level, message, data);

  switch (level) {
    case 'error':
      console.error(JSON.stringify(entry));
      break;
    case 'warn':
      console.warn(JSON.stringify(entry));
      break;
    default:
      console.log(JSON.stringify(entry));
  }
}

export const logger = {
  debug: (message: string, data?: Record<string, unknown>) => writeLog('debug', message, data),
  info: (message: string, data?: Record<string, unknown>) => writeLog('info', message, data),
  warn: (message: string, data?: Record<string, unknown>) => writeLog('warn', message, data),
  error: (message: string, data?: Record<string, unknown>) => writeLog('error', message, data),

  /** Log a tool invocation */
  toolInvocation(tool: string, params: Record<string, unknown>, endpoint: string): void {
    writeLog('info', 'Tool invoked', { tool, params, endpoint });
  },

  /** Log a tool result */
  toolResult(tool: string, durationMs: number, success: boolean, error?: string): void {
    const data: Record<string, unknown> = { tool, durationMs, success };
    if (error) data.error = error;
    writeLog(success ? 'info' : 'error', 'Tool completed', data);
  },
};
