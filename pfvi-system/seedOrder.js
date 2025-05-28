require('dotenv').config({ path: '.env.local' });

const mongoose = require('mongoose');
const Order = require('./models/Order');
const User = require('./models/User');

const uri = process.env.MONGODB_URI;

async function seedOrder() {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Find an existing salesman
    const salesman = await User.findOne({ role: 'salesman' });

    if (!salesman) {
      throw new Error('Salesman user not found. Please seed user first.');
    }

    // Create one sample order
    const testOrder = {
      salesmanID: salesman._id,
      customerName: 'Jollibee',
      invoice: 'INV-20240527-001',
      paymentAmt: 1500.00,
      paymentMethod: 'Cash',
      dateMade: new Date(),
      contactNumber: '09171234567',
      assignmentStatus: 'No Driver Assigned',
      driverAssignedID: null,
      orderStatus: 'Being Prepared',
      dateDelivered: null,
      deliveryReceivedBy: null,
      paymentReceived: null,
      paymentReceivedBy: null,
      salesmanNotes: 'Please prepare for urgent delivery.',
      driverNotes: null,
      secretaryNotes: null
    };

    const order = await Order.create(testOrder);
    console.log('Test order created:', order);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (err) {
    console.error('Error:', err);
  }
}

seedOrder();
