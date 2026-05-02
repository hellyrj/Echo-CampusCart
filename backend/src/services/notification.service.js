import User from "../models/user.model.js";

export class NotificationService {
    static async sendRejectionNotification(userId, vendorName, rejectionReason) {
        try {
            // Find the user
            const user = await User.findById(userId);
            
            if (!user) {
                console.error(`User not found for rejection notification: ${userId}`);
                return false;
            }
            
            // Create notification message
            const notificationMessage = {
                type: 'vendor_rejection',
                title: 'Vendor Application Rejected',
                message: `Your vendor application for "${vendorName}" has been rejected.`,
                details: rejectionReason,
                timestamp: new Date(),
                read: false
            };
            
            // Add notification to user's notifications array
            if (!user.notifications) {
                user.notifications = [];
            }
            
            user.notifications.push(notificationMessage);
            await user.save();
            
            console.log(`Rejection notification sent to user ${userId} for vendor "${vendorName}"`);
            return true;
            
        } catch (error) {
            console.error('Error sending rejection notification:', error);
            return false;
        }
    }
    
    static async sendApprovalNotification(userId, vendorName) {
        try {
            // Find the user
            const user = await User.findById(userId);
            
            if (!user) {
                console.error(`User not found for approval notification: ${userId}`);
                return false;
            }
            
            // Create notification message
            const notificationMessage = {
                type: 'vendor_approval',
                title: 'Vendor Application Approved!',
                message: `Congratulations! Your vendor application for "${vendorName}" has been approved.`,
                timestamp: new Date(),
                read: false
            };
            
            // Add notification to user's notifications array
            if (!user.notifications) {
                user.notifications = [];
            }
            
            user.notifications.push(notificationMessage);
            await user.save();
            
            console.log(`Approval notification sent to user ${userId} for vendor "${vendorName}"`);
            return true;
            
        } catch (error) {
            console.error('Error sending approval notification:', error);
            return false;
        }
    }
}
