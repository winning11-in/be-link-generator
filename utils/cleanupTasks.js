import Payment from '../models/Payment.js';

/**
 * Clean up expired unpaid orders
 * This should be called periodically (e.g., via cron job)
 */
export const cleanupExpiredOrders = async () => {
  try {
    const result = await Payment.deleteMany({
      status: 'created',
      expiresAt: { $lt: new Date() }
    });
    
    console.log(`Cleanup: Removed ${result.deletedCount} expired unpaid orders`);
    return result.deletedCount;
  } catch (error) {
    console.error('Error cleaning up expired orders:', error);
    throw error;
  }
};

/**
 * Get cleanup statistics
 */
export const getCleanupStats = async () => {
  try {
    const expiredCount = await Payment.countDocuments({
      status: 'created',
      expiresAt: { $lt: new Date() }
    });
    
    const pendingCount = await Payment.countDocuments({
      status: 'created',
      expiresAt: { $gte: new Date() }
    });
    
    const paidCount = await Payment.countDocuments({
      status: 'paid'
    });
    
    return {
      expired: expiredCount,
      pending: pendingCount,
      paid: paidCount
    };
  } catch (error) {
    console.error('Error getting cleanup stats:', error);
    throw error;
  }
};

// Auto-cleanup function that can be called on server start
export const scheduleCleanup = () => {
  // Clean up every hour
  setInterval(async () => {
    try {
      await cleanupExpiredOrders();
    } catch (error) {
      console.error('Scheduled cleanup failed:', error);
    }
  }, 60 * 60 * 1000); // 1 hour
  
  console.log('Scheduled cleanup task initialized');
};