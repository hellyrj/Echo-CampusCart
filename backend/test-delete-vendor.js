import mongoose from 'mongoose';
import Vendor from './src/models/vendor.model.js';
import Product from './src/models/product.model.js';
import User from './src/models/user.model.js';
import dotenv from 'dotenv';

dotenv.config();

const testDeleteVendor = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        console.log('=== Testing Vendor Deletion ===');
        
        // Create a test user
        const testUser = await User.create({
            name: 'Test Vendor User',
            email: 'testvendor@example.com',
            password: 'password123',
            role: 'vendor'
        });
        
        // Create a test vendor
        const testVendor = await Vendor.create({
            ownerId: testUser._id,
            storeName: 'Test Vendor Store',
            email: 'vendor@store.com',
            phone: '+1234567890',
            address: '123 Test Street',
            universityNear: 'Test University',
            status: 'approved',
            isActive: true,
            locationDetails: {
                fullAddress: '123 Test Street',
                city: 'Test City',
                state: 'Test State',
                placeName: 'Test Place',
                coordinates: [0, 0]
            }
        });
        
        // Create test products for the vendor
        const testProduct1 = await Product.create({
            name: 'Test Product 1',
            vendorId: testVendor._id,
            basePrice: 100,
            isAvailable: true
        });
        
        const testProduct2 = await Product.create({
            name: 'Test Product 2',
            vendorId: testVendor._id,
            basePrice: 200,
            isAvailable: true
        });
        
        console.log('Created test data:');
        console.log('- User:', testUser.name, testUser.role);
        console.log('- Vendor:', testVendor.storeName);
        console.log('- Products:', 2);
        
        // Test the deletion process (simulate what the service does)
        console.log('\n--- Testing Deletion Process ---');
        
        // Delete products
        const productDeleteResult = await Product.deleteMany({ vendorId: testVendor._id });
        console.log('Deleted products:', productDeleteResult.deletedCount);
        
        // Delete vendor
        const vendorDeleteResult = await Vendor.findByIdAndDelete(testVendor._id);
        console.log('Deleted vendor:', vendorDeleteResult?.storeName);
        
        // Reset user role
        const userUpdateResult = await User.findByIdAndUpdate(
            testUser._id,
            { role: 'student' },
            { returnDocument: 'after' }
        );
        console.log('Reset user role:', userUpdateResult?.name, '->', userUpdateResult?.role);
        
        // Verify deletion
        const remainingVendor = await Vendor.findById(testVendor._id);
        const remainingProducts = await Product.find({ vendorId: testVendor._id });
        const updatedUser = await User.findById(testUser._id);
        
        console.log('\n--- Verification ---');
        console.log('Vendor exists:', !!remainingVendor);
        console.log('Products remain:', remainingProducts.length);
        console.log('User role:', updatedUser?.role);
        
        // Cleanup
        await User.deleteMany({ email: 'testvendor@example.com' });
        
        console.log('\n✅ Vendor deletion test completed successfully!');
        
    } catch (error) {
        console.error('Test error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

testDeleteVendor();
