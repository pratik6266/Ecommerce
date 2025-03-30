const express = require('express');
const { isLoggedIn } = require('../middlewares/isLoggedIn');
const productModel = require('../model/product.model');
const Router = express.Router();

Router.get('/', (req, res) => {
  let error = req.flash('error');
  res.render('index', {error});
})

module.exports =  Router;