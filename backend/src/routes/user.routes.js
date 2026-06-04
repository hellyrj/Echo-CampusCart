import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { uploadProfilePicture } from "../middlewares/profileUpload.js";
import { CloudinaryService } from "../services/cloudinary.service.js";
import User from "../models/user.model.js";

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Get user notifications
router.get("/notifications", async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('notifications');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Sort notifications by timestamp (newest first)
        const notifications = (user.notifications || []).sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        );

        res.json({
            success: true,
            data: {
                notifications,
                unreadCount: notifications.filter(n => !n.read).length
            }
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch notifications"
        });
    }
});

// Mark notification as read
router.patch("/notifications/:notificationId/read", async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.user._id;

        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Find and update the notification
        const notification = user.notifications.id(notificationId);
        
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found"
            });
        }

        notification.read = true;
        await user.save();

        res.json({
            success: true,
            message: "Notification marked as read"
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({
            success: false,
            message: "Failed to mark notification as read"
        });
    }
});

// Get user profile
router.get("/profile", async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password -notifications');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            data: {
                user
            }
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch user profile"
        });
    }
});

router.patch("/profile", uploadProfilePicture, async (req, res) => {
    try {
        const userId = req.user._id;
        const { name, email } = req.body;
        const updates = {};
        
        if (name) updates.name = name;
        if (email) updates.email = email;
        
        if (req.file) {
            // Upload the picture to Cloudinary
            const result = await CloudinaryService.uploadImage(req.file, {
                folder: 'campuscart/users'
            });
            updates.profilePicture = result.url;
        }
        
        const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password -notifications');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        res.json({
            success: true,
            message: "Profile updated successfully",
            data: {
                user
            }
        });
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({
            success: false,
            message: "Failed to update user profile"
        });
    }
});

export default router;
