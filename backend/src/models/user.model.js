const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const encryption = require('../utils/encryption');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 20
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    firstName: {
      type: String,
      trim: true
    },
    lastName: {
      type: String,
      trim: true
    },
    profilePicture: {
      type: String,
      default: ''
    },
    role: {
      type: String,
      enum: ['user', 'guide', 'admin'],
      default: 'user'
    },
    savedTours: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tour'
    }],
    savedItineraries: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Itinerary'
    }],
    // Sensitive information (encrypted)
    phoneNumber: {
      type: String,
      default: null
    },
    address: {
      type: String,
      default: null
    },
    paymentInfo: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Hash password and encrypt sensitive data before saving
userSchema.pre('save', async function(next) {
  try {
    // Hash password if modified
    if (this.isModified('password')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }

    // Encrypt phone number if modified
    if (this.isModified('phoneNumber') && this.phoneNumber) {
      this.phoneNumber = encryption.encrypt(this.phoneNumber);
    }

    // Encrypt address if modified
    if (this.isModified('address') && this.address) {
      this.address = encryption.encrypt(this.address);
    }

    // Encrypt payment info if modified
    if (this.isModified('paymentInfo') && this.paymentInfo) {
      this.paymentInfo = encryption.encrypt(this.paymentInfo);
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Methods to get decrypted sensitive information
userSchema.methods.getDecryptedPhoneNumber = function() {
  if (!this.phoneNumber) return null;
  return encryption.decrypt(this.phoneNumber);
};

userSchema.methods.getDecryptedAddress = function() {
  if (!this.address) return null;
  return encryption.decrypt(this.address);
};

userSchema.methods.getDecryptedPaymentInfo = function() {
  if (!this.paymentInfo) return null;
  return encryption.decrypt(this.paymentInfo, true);
};

// Transform the document when converting to JSON
userSchema.methods.toJSON = function() {
  const user = this.toObject();

  // Remove sensitive information from the JSON output
  delete user.password;
  delete user.paymentInfo;

  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
