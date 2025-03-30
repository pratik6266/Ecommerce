const mongoose = require('mongoose');

  const ownerSchema = new mongoose.Schema({
    fullname: String,
    email: String,
    password: String,
    product: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'product',
      default: []
    }],
    picture: String,
    gstin: Number,
  }, {timestamps: true})

  module.exports = mongoose.model('owner', ownerSchema);