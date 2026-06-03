import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../models/user.model.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Sample users to seed
const users = [
    {
        name: 'jhon Student',
        email: 'student@campus.com',
        password: 'student123',
        role: 'student'
    },
    {
        name: 'echo Vendor',
        email: 'vendor@campus.com',
        password: 'vendor123',
        role: 'vendor'
    },
    {
        name: 'Admin User',
        email: 'admin@campus.com',
        password: 'admin123',
        role: 'admin'
    }
];

const seedUsers = async () => {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/echocart';
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        // Clear existing users (optional - comment out if you want to keep existing users)
       // await User.deleteMany({});
        console.log('Cleared existing users');

        // Hash passwords and create users
        const hashedUsers = await Promise.all(
            users.map(async (user) => {
                const hashedPassword = await bcrypt.hash(user.password, 10);
                return {
                    ...user,
                    password: hashedPassword
                };
            })
        );

        // Insert users into database
        const insertedUsers = await User.insertMany(hashedUsers);
        console.log('Successfully seeded users:');
        
        insertedUsers.forEach((user, index) => {
            console.log(`${index + 1}. ${user.name} (${user.role}) - ${user.email} - Password: ${users[index].password}`);
        });

        console.log('\nLogin Credentials:');
        console.log('==================');
        console.log('Student Account:');
        console.log('  Email: student@campus.com');
        console.log('  Password: student123');
        console.log('  Role: student');
        console.log('');
        console.log('Vendor Account:');
        console.log('  Email: vendor@campus.com');
        console.log('  Password: vendor123');
        console.log('  Role: vendor');
        console.log('');
        console.log('Admin Account:');
        console.log('  Email: admin@campus.com');
        console.log('  Password: admin123');
        console.log('  Role: admin');

    } catch (error) {
        console.error('Error seeding users:', error);
    } finally {
        // Close database connection
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
};

// Run the seed function
seedUsers();
