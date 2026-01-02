import { createLog } from '../controllers/logController.js';

/**
 * Middleware to log HTTP requests
 */
export const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Capture the original end function
  const originalEnd = res.end;
  
  // Override the end function to log after response
  res.end = function(...args) {
    // Restore original end function
    res.end = originalEnd;
    
    // Call original end
    res.end.apply(res, args);
    
    // Log the request
    const duration = Date.now() - startTime;
    const logData = {
      timestamp: new Date(),
      level: res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info',
      message: `${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      userId: req.user?._id,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      meta: {
        duration,
        query: req.query,
      },
    };
    
    // Don't wait for log to be saved
    createLog(logData).catch(err => console.error('Failed to create log:', err));
  };
  
  next();
};

/**
 * Manually create a log entry
 */
export const logEvent = async (level, message, meta = {}) => {
  try {
    await createLog({
      level,
      message,
      timestamp: new Date(),
      meta,
    });
  } catch (error) {
    console.error('Failed to log event:', error);
  }
};

/**
 * Log error with stack trace
 */
export const logError = async (error, req = null) => {
  try {
    const logData = {
      level: 'error',
      message: error.message || 'Unknown error',
      timestamp: new Date(),
      error: {
        stack: error.stack,
        code: error.code,
      },
    };
    
    if (req) {
      logData.method = req.method;
      logData.path = req.path;
      logData.userId = req.user?._id;
      logData.ip = req.ip || req.connection.remoteAddress;
      logData.userAgent = req.get('user-agent');
    }
    
    await createLog(logData);
  } catch (err) {
    console.error('Failed to log error:', err);
  }
};

export default requestLogger;
