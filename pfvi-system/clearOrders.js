require('dotenv').config({ path: '.env.local' });

const mongoose = require('mongoose');
const Order = require('./models/Order'); // adjust path if needed

const uri = process.env.MONGODB_URI;

async function clearOrders() {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    const result = await Order.deleteMany({});
    console.log(`Cleared ${result.deletedCount} orders`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (err) {
    console.error('Error clearing orders:', err);
  }
}

clearOrders();
