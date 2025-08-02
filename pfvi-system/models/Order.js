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
    default: null,
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
    default: null,
  },
  assignmentStatus: { 
    type: String, 
    enum: ['No Driver Assigned', 'Driver Assigned'], default: 'No Driver Assigned', 
    required: true 
  },
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
    required: true 
  },
  dateDelivered: {
    type: Date,
    default: null,
  },
  deliveryReceivedBy: {
    type: String,
    default: null,
  },
  paymentReceived: {
    type: Number,
    default: null,
  },
  paymentReceivedBy: {
    type: String,
    default: null,
  },
  salesmanNotes: {
    type: String,
    default: null,
  },
  driverNotes: {
    type: String,
    default: null,
  },
  secretaryNotes: {
    type: String,
    default: null,
  },
  orderNumber: {
    type: Number,
    unique: true,
    required: true,
  }
}, { timestamps: true });

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
module.exports = Order;