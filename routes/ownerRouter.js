const express = require('express');
const router = express.Router();
const ownerModel = require('../model/owner.model');
const bcrypt = require('bcrypt');
const isOwnerlogged = require('../middlewares/isOwnerlogged')

router.post('/create', async (req, res) => {
  let {fullname, email, password, gstin} = req.body;

  if(!fullname || !email || !password || !gstin) {
    return res.status(404).send("All Field are required");
  }

  let owner = await ownerModel.findOne({email});
  if(owner) {
    return res.status(401).send('Owner exists already');
  }

  bcrypt.genSalt(10, (err, salt) => {
    if(err){
      throw new Error(err);
    }
    bcrypt.hash(password, salt, async (err, hash) => {
      if(err){
        throw new Error(err);
      }
      let newOwner = await ownerModel.create({
        fullname,
        email,
        password: hash,
        gstin,
      })

      res.send(newOwner);
    })
  })
})

router.get('/admin', isOwnerlogged, (req, res) => {
  let success = req.flash('success');
  res.render('createProduct', {success});  
})

router.get('/logout', isOwnerlogged, (req, res) => {
  res.clearCookie('token');
  res.status(200).redirect('/');
})

router.get('/homepage', isOwnerlogged, (req, res) => {
  res.render('ownershop', {products: req.user.product || []});
})

module.exports = router;