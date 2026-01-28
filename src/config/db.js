import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        // Add timeout options to prevent hanging during deployment
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000, // 10 seconds timeout for server selection
            socketTimeoutMS: 45000, // 45 seconds timeout for socket operations
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`✅ Database Name: ${conn.connection.name}`);
        return conn;
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        console.error('Stack trace:', error.stack);
        throw error; // Re-throw to be caught by server.js
    }
};

export default connectDB;
