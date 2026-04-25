import mongoose from 'mongoose';
import Vendor from '../models/vendor.model.js';
import dotenv from 'dotenv';

dotenv.config();

const migrateVendorStatus = async () => {
    try {
        console.log('Starting vendor status migration...');
        
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to database');

        // Find all vendors without status field
        const vendorsWithoutStatus = await Vendor.find({ status: { $exists: false } });
        console.log(`Found ${vendorsWithoutStatus.length} vendors without status field`);

        // Update each vendor
        for (const vendor of vendorsWithoutStatus) {
            let newStatus = 'pending';
            
            // If vendor is approved, set status to 'approved'
            if (vendor.isApproved === true) {
                newStatus = 'approved';
            }
            // If vendor has rejectionReason, set status to 'rejected'
            else if (vendor.rejectionReason && vendor.rejectionReason.trim() !== '') {
                newStatus = 'rejected';
            }
            
            console.log(`Updating vendor ${vendor.storeName}: isApproved=${vendor.isApproved}, rejectionReason=${vendor.rejectionReason} -> status=${newStatus}`);
            
            await Vendor.findByIdAndUpdate(
                vendor._id,
                { status: newStatus },
                { new: true }
            );
            
            console.log(`✅ Updated vendor ${vendor.storeName}: status -> ${newStatus}`);
        }

        console.log('Migration completed successfully!');
        
        // Show summary
        const pendingCount = await Vendor.countDocuments({ status: 'pending' });
        const approvedCount = await Vendor.countDocuments({ status: 'approved' });
        const rejectedCount = await Vendor.countDocuments({ status: 'rejected' });
        
        console.log('\nSummary:');
        console.log(`Pending: ${pendingCount}`);
        console.log(`Approved: ${approvedCount}`);
        console.log(`Rejected: ${rejectedCount}`);
        
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from database');
    }
};

// Run migration
migrateVendorStatus();
