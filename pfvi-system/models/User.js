const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
  type: String,
  required: true,
  },
  role: {
    type: String,
    enum: ['driver', 'salesman', 'secretary'],
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (v) {
        return /^(09\d{9}|\+639\d{9})$/.test(v);
      },
      message: props => `${props.value} is not a valid Philippine phone number!`
    }
  },
  passwordHash: {
    type: String,
    required: true,
  },
  status: { type: String, enum: ['Inactive', 'Active'], default: 'Inactive' },
  isVerified: { type: Boolean, default: false }, // verified by the admin 
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);
module.exports = User;