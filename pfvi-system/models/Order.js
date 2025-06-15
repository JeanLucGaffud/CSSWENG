const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  salesmanID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  customerName: {
    type: String,
    required: true,
  },
  invoice: {
    type: String,
    required: false,
  },
  paymentAmt: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Cheque'],
    required: true,
  },
  dateMade: {
    type: Date,
    required: true,
  },
  contactNumber: {
    type: String,
  },
  assignmentStatus: { 
    type: String, 
    enum: ['No Driver Assigned', 'Driver Assigned'], default: 'No Driver Assigned', 
    required: true },
  driverAssignedID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    default: null,
  },
  orderStatus: { 
    type: String, 
    enum: ['Being Prepared', 'Picked Up', 'In Transit', 'Delivered', 'Deferred', 'Cancelled'], 
    default: 'Being Prepared', 
    required: true },
  dateDelivered: {
    type: Date,
  },
  deliveryReceivedBy: {
    type: String,
  },
  paymentReceived: {
    type: Number,
  },
  paymentReceivedBy: {
    type: String,
  },
  salesmanNotes: {
    type: String,
  },
  driverNotes: {
    type: String,
  },
  secretaryNotes: {
    type: String,
  }
}, { timestamps: true });

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
module.exports = Order;