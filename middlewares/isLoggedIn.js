const jwt = require('jsonwebtoken');
const userModel = require('../model/user.model');
require('dotenv').config();

module.exports.isLoggedIn = async (req, res, next) => {
  if(!req.cookies.token){
    req.flash('error', 'You need to login first');
    return res.redirect('/');
  }

  try {
    let decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
    let user = await userModel
    .findOne({email: decoded.email})
    .select('-password');

    if (!user) {
      req.flash('error', 'Session expired. Please log in again.');
      res.clearCookie('token');
      return res.redirect('/');
    }

    req.user = user;
    return next();
  } catch (error) {
    req.flash('error', 'something went wrong');
    return res.redirect('/');
  }
}