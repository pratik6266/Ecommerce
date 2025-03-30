const mongoose = require('mongoose');

  const cartSchema = new mongoose.Schema({
    image: Buffer,
    productId: String,
    name: String,
    orderDate: String,
    price: Number,
    discount: {
      type: Number,
      default: 0
    },
    quantity: {
      type: Number,
      default: 1
    },
    bgcolor: String,
    panelcolor: String,
    textcolor: String
  }, {timestamps: true})

  module.exports = mongoose.model('cart', cartSchema);