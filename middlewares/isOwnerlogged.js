const jwt = require('jsonwebtoken');
require('dotenv').config();
const ownerModel = require('../model/owner.model')

module.exports = async (req, res, next) => {
  if(!req.cookies.token){
    req.flash('error', 'You need to login first');
    return res.status(404).redirect('/');
  }

  try {
    let decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
    let user = await ownerModel
    .findOne({email: decoded.email})
    .select('-password');
    req.user = user;
    next();
  } catch (error) {
    req.flash('error', 'something went wrong');
    return res.redirect('/');
  }
}