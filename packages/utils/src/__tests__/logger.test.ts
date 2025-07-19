import { describe, it, expect, vi } from 'vitest';
import { createLogger } from '../logger.js';

describe('Logger', () => {
  it('should log messages at appropriate levels', () => {
    const handler = vi.fn();
    const logger = createLogger({
      level: 'info',
      handler
    });
    
    logger.debug('Debug message');
    logger.info('Info message');
    logger.warn('Warn message');
    logger.error('Error message');
    
    // Debug should be ignored at info level
    expect(handler).toHaveBeenCalledTimes(3);
    expect(handler).toHaveBeenCalledWith('info', '[Motif] Info message', []);
    expect(handler).toHaveBeenCalledWith('warn', '[Motif] Warn message', []);
    expect(handler).toHaveBeenCalledWith('error', '[Motif] Error message', []);
  });
  
  it('should respect custom prefix', () => {
    const handler = vi.fn();
    const logger = createLogger({
      prefix: '[CustomPrefix]',
      handler
    });
    
    logger.info('Test message');
    
    expect(handler).toHaveBeenCalledWith('info', '[CustomPrefix] Test message', []);
  });
  
  it('should pass additional arguments', () => {
    const handler = vi.fn();
    const logger = createLogger({ handler });
    
    const data = { foo: 'bar' };
    logger.info('Message with data', data, 123);
    
    expect(handler).toHaveBeenCalledWith(
      'info',
      '[Motif] Message with data',
      [data, 123]
    );
  });
  
  it('should use console methods when no handler provided', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    const logger = createLogger();
    logger.info('Test message');
    
    expect(consoleSpy).toHaveBeenCalledWith('[Motif] Test message');
    
    consoleSpy.mockRestore();
  });
}); 