require('dotenv').config({ path: '.env.local' });

const mongoose = require('mongoose');
const Order = require('./models/Order'); // adjust path if needed

const uri = process.env.MONGODB_URI;

async function seedOrder() {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    const testOrder = {
      salesmanID: 'SAL12345',
      customerName: 'Juan Dela Cruz',
      invoice: 'INV-2025-001',
      paymentAmt: 5000,
      paymentMethod: 'Cash',
      dateMade: new Date(),
      contactNumber: '09171234567',
      assignmentStatus: 'No Driver Assigned',
      driverAssignedID: '',
      orderStatus: 'Being Prepared',
      dateDelivered: null,
      deliveryReceivedBy: '',
      paymentReceived: 0,
      paymentReceivedBy: '',
      salesmanNotes: 'Requested delivery next week',
      driverNotes: '',
      secretaryNotes: ''
    };

    const order = await Order.create(testOrder);
    console.log('Test order created:', order);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (err) {
    console.error('Error seeding order:', err);
  }
}

seedOrder();
