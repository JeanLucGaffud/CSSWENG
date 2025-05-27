const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;

const options = {
  serverApi: { version: '1', strict: true, deprecationErrors: true },
};

async function connectToDatabase() {
  if (mongoose.connection.readyState >= 1) {
    // Already connected
    return;
  }
  try {
    await mongoose.connect(uri, options);
    console.log('MongoDB connected!');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

module.exports = connectToDatabase;