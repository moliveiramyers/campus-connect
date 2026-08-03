import 'dotenv/config';
import mongoose from 'mongoose';
import dns from 'dns';
dns.setServers(['8.8.8.8']);

const connectDB = async () => {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

    if (!mongoUri) {
        throw new Error('MONGODB_URI is required to connect to MongoDB.');
    }

    try {
        const connection = await mongoose.connect(mongoUri, {
            dbName: 'campus-connect'
        });
        console.log(`MongoDB Connected: ${connection.connection.host}`);
    } catch (error) {
        throw new Error(`MongoDB connection failed: ${error.message}`);
    }
};

export default connectDB;
