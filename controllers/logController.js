import Log from '../models/Log.js';
import User from '../models/User.js';

/**
 * Get all logs with pagination and filtering
 * @route GET /api/admin/logs
 * @access Private (Admin only)
 */
export const getLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, level } = req.query;
    
    const query = {};
    
    // Filter by level
    if (level && ['info', 'warn', 'error', 'debug'].includes(level)) {
      query.level = level;
    }
    
    // Search in message, path, userName, or userEmail
    if (search) {
      query.$or = [
        { message: { $regex: search, $options: 'i' } },
        { path: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } },
        { ip: { $regex: search, $options: 'i' } },
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get logs with pagination
    const logs = await Log.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    const total = await Log.countDocuments(query);
    
    res.json({
      logs,
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ message: 'Failed to fetch logs', error: error.message });
  }
};

/**
 * Create a new log entry
 * @param {Object} logData - Log data
 */
export const createLog = async (logData) => {
  try {
    // If userId is provided, fetch user details
    if (logData.userId) {
      const user = await User.findById(logData.userId).select('name email').lean();
      if (user) {
        logData.userName = user.name;
        logData.userEmail = user.email;
      }
    }
    
    const log = new Log(logData);
    await log.save();
    return log;
  } catch (error) {
    console.error('Error creating log:', error);
  }
};

/**
 * Clear old logs (optional cleanup utility)
 * @route DELETE /api/admin/logs/cleanup
 * @access Private (Admin only)
 */
export const cleanupLogs = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
    
    const result = await Log.deleteMany({
      timestamp: { $lt: cutoffDate }
    });
    
    res.json({
      message: `Deleted logs older than ${days} days`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('Error cleaning up logs:', error);
    res.status(500).json({ message: 'Failed to cleanup logs', error: error.message });
  }
};
