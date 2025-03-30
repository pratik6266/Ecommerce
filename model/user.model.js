const mongoose = require('mongoose');

  const userSchema = new mongoose.Schema({
    image: Buffer,
    fullname: String,
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: String,
    cartItems: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'cart'
    }],
    orders: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'cart'
    }],
    contact: Number,
  }, {timestamps: true})

  module.exports = mongoose.model('user', userSchema);