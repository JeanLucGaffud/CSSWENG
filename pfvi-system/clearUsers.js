require('dotenv').config({ path: '.env.local' }); // Loads .env.local or .env
const mongoose = require('mongoose');
const User = require('./models/User'); 

async function clearUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await User.deleteMany({});
    console.log('All users cleared successfully.');
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error clearing users:', err);
  }
}

clearUsers();