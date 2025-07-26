

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
  },
  mobileNumber: {
    type: String,
    required: true,
    unique: true,
    match: /^[6-9]\d{9}$/, // Indian mobile number pattern
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'store_manager', 'delivery_person'],
    default: 'store_manager',
  },
}, {
  timestamps: true,
});

// 🔒 Password hash before saving
UserSchema.pre('save', async function (next) {
  try {
    if (this.isNew || this.isModified('password')) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(this.password, salt);
      this.password = hashedPassword;
    }
    next();
  } catch (error) {
    next(error);
  }
});

// ✅ Password check method
UserSchema.methods.isValidPassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    throw error;
  }
};

const User = mongoose.model('User', UserSchema);
module.exports = User;
