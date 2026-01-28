/**
 * Quick diagnostic script to test MongoDB connection
 * Run this locally to verify your connection string works
 */

import 'dotenv/config';
import mongoose from 'mongoose';

console.log('🔍 Testing MongoDB Connection...\n');
console.log('📍 MongoDB URI:', process.env.MONGODB_URI ? 'Set ✅' : 'Missing ❌');
console.log('📍 NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('\n🔄 Attempting connection...\n');

const testConnection = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });

        console.log('✅ SUCCESS! MongoDB Connected');
        console.log('📍 Host:', conn.connection.host);
        console.log('📍 Database:', conn.connection.name);
        console.log('📍 Port:', conn.connection.port);

        await mongoose.connection.close();
        console.log('\n✅ Connection closed successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ FAILED! MongoDB Connection Error');
        console.error('Error:', error.message);
        console.error('\nCommon fixes:');
        console.error('1. Check MongoDB Atlas Network Access - Add 0.0.0.0/0 to IP whitelist');
        console.error('2. Verify username and password in connection string');
        console.error('3. Check if MongoDB Atlas cluster is running');
        console.error('4. Verify MONGODB_URI in .env file');
        process.exit(1);
    }
};

testConnection();
