const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(`${process.env.MONGODB_URL}/Ecommerce`)
.then(() => {
  console.log('MongoDB Connected');
})
.catch((err) => {
  throw new Error('Error Connecting MongoDB', err);
})

module.exports = mongoose.connection; 