export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface Logger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}

export interface LoggerConfig {
  level?: LogLevel;
  prefix?: string;
  handler?: (level: LogLevel, message: string, args: any[]) => void;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

/**
 * Creates a logger instance with configurable behavior
 */
export function createLogger(config: LoggerConfig = {}): Logger {
  const {
    level = 'info',
    prefix = '[Motif]',
    handler
  } = config;
  
  const minLevel = LOG_LEVELS[level];
  
  function log(logLevel: LogLevel, message: string, ...args: any[]) {
    if (LOG_LEVELS[logLevel] < minLevel) {
      return;
    }
    
    const formattedMessage = `${prefix} ${message}`;
    
    if (handler) {
      handler(logLevel, formattedMessage, args);
    } else {
      // Default console logging
      switch (logLevel) {
        case 'debug':
          console.debug(formattedMessage, ...args);
          break;
        case 'info':
          console.log(formattedMessage, ...args);
          break;
        case 'warn':
          console.warn(formattedMessage, ...args);
          break;
        case 'error':
          console.error(formattedMessage, ...args);
          break;
      }
    }
  }
  
  return {
    debug: (message: string, ...args: any[]) => log('debug', message, ...args),
    info: (message: string, ...args: any[]) => log('info', message, ...args),
    warn: (message: string, ...args: any[]) => log('warn', message, ...args),
    error: (message: string, ...args: any[]) => log('error', message, ...args)
  };
}

// Default logger instance with environment-based log level
export const logger = createLogger({
  level: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_MOTIF_LOG_LEVEL as LogLevel) || 
         (typeof process !== 'undefined' && process.env?.MOTIF_LOG_LEVEL as LogLevel) || 
         'info'
}); 