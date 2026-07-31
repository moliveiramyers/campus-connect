import 'dotenv/config';
import mongoose from 'mongoose';
import dns from 'dns';
dns.setServers(['8.8.8.8']);

const connectDB = async () => {

     try {
        const connection = await mongoose.connect(process.env.MONGO_URI, {
           dbName: 'campus-connect'
        });
        console.log(`MongoDB Connected: ${connection.connection.host}`);
        } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
     }


    if (!mongoUri) {
        throw new Error('MONGODB_URI is required to connect to MongoDB.');
    }

    const connection = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${connection.connection.host}`);
};

export default connectDB;
