const express = require('express');
const router = express.Router();
const upload = require('../config/multer-config');
const productModel = require('../model/product.model')
const ownerModel = require('../model/owner.model');
const isOwnerlogged = require('../middlewares/isOwnerlogged');

router.get('/', (req, res) => {
  res.send('product');
})

router.post('/create', isOwnerlogged, upload.single('image'), async (req, res) => {
  try {
    let {name, price, discount, bgcolor, panelcolor, textcolor} = req.body;

    if(!name || !price || !bgcolor || !panelcolor || !textcolor || !req.file || !req.file.buffer) {
      req.flash('success', 'Please Enter Details');
      return res.status(403).redirect('/owner/admin');
    }
  
    let product = await productModel.create({
      image: req.file.buffer, 
      name,
      price, 
      discount,
      bgcolor,
      panelcolor,
      textcolor,
    })

    let email = req.user.email;
    let owner = await ownerModel.findOne({email});
    if(!owner){
      req.flash('error', 'Something went wrong user not found');
      return res.status(404).redirect('/');
    }
    owner.product.push(product._id);
    await owner.save();

    req.flash('success', 'Product Created Sucessfully');
    res.status(200).redirect('/owner/admin');
  } catch (error) {
    req.flash('success', 'Something went wrong here ');
    return res.status(403).redirect('/owner/admin');
  }
})

module.exports = router;