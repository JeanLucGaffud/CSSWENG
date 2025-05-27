require('dotenv').config({ path: '.env.local' });

const mongoose = require('mongoose');
const User = require('./models/User'); 

const uri = process.env.MONGODB_URI;

async function seed() {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Create a test user (change fields as needed)
    const testUser = {
      firstName: 'Test',
      lastName: 'User',
      role: 'salesman',
      phoneNumber: '09171234567',
      passwordHash: 'hashed_password',
      status: 'Active'
    };

    const user = await User.create(testUser);
    console.log('Test user created:', user);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (err) {
    console.error('Error:', err);
  }
}

seed();