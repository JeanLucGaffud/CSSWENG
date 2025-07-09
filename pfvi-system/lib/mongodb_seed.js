import mongoose from 'mongoose';

const options = {
    serverApi: { version: '1', strict: true, deprecationErrors: true },
};

async function connectToDatabase() {
    if (mongoose.connection.readyState >= 1) {
    return;
    }

    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error('MONGODB_URI is not defined in environment variables');
    }
    try {
        console.log('Connecting to MongoDB at:', uri);
        await mongoose.connect(uri, options);
        console.log('MongoDB connected!');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
}

export { connectToDatabase };