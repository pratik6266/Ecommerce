const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { registerUser, loginUser, logout } = require('../controllers/userAuthControllers');
const { isLoggedIn } = require('../middlewares/isLoggedIn');
const productModel = require('../model/product.model');
const userModel = require('../model/user.model');
const cartModel = require('../model/cart.model');
const upload = require('../config/multer-config');
const generateToken = require('../config/generateToken');

router.get('/', (req, res) => {
  res.status(200).send('User Base Route Working');
})

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/logout', isLoggedIn, logout);

router.get('/shop', isLoggedIn, async (req, res) => {
  let products = await productModel.find();
  let success = req.flash('success');
  res.render('shop', {products, success});
})

router.get('/profile', isLoggedIn, (req, res) => {
  res.render('profile', {user: req.user});
})

router.get('/addtocart/:id', isLoggedIn, async (req, res) => {
  const user = await userModel.findById(req.user._id).populate("cartItems").exec();
  let id = req.params.id;

  const ans = user.cartItems.findIndex(item => item.productId === id);

  if(ans != -1){
    req.flash('success', 'Already In Cart');
    return res.redirect('/user/shop')
  }

  let date = new Date();
  date = date.toLocaleDateString();
  let item = await productModel.findOne({_id : id});
  let newItem = await cartModel.create({
    image: item.image,
    name: item.name,
    productId: item._id,
    orderDate: date,
    price: item.price,
    discount: item.discount,
    quantity: 1,
    bgcolor: item.bgcolor,
    panelcolor: item.panelcolor,
    textcolor: item.textcolor
  });

  user.cartItems.push(newItem);
  await user.save();
  user.populate('cartItems');

  req.flash('success', 'Added to Cart');
  res.redirect('/user/shop');
})

router.get('/cart', isLoggedIn, async (req, res) => {
  let user = req.user;
  let success = req.flash('success') || '';
  await user.populate('cartItems');
  res.render('cart', {user, success}); 
})

router.get('/removeFromCart/:id', isLoggedIn, async (req, res) => {
  const id = req.params.id;
  let user = req.user;
  let ans = user.cartItems.findIndex(item => item.toString() === id);
  user.cartItems.splice(ans, 1);
  await user.save();
  req.flash('success', 'Removed');
  res.redirect('/user/cart');
})

router.get('/changePassword', isLoggedIn, (req, res) => {
  let success = req.flash('success') || '';
  res.render('changePassword', {success});
})

router.post('/changePassword', isLoggedIn, async (req, res) => {
  const {current, newpass, confirm} = req.body;
  console.log(req.user);

  if(newpass !== confirm){
    req.flash('success', 'Confirm password did not match');
    return res.status(401).redirect('/user/changePassword');
  }

  let user = await userModel.findOne({email: req.user.email});
  if(!user){
    req.flash('success', 'Something went wrong');
    return res.status(501).redirect('/user/changePassword');
  }

  bcrypt.compare(current, user.password, (err, result) => {
    if(err){
      req.flash('success', 'Something went wrong');
      return res.status(502).redirect('/user/changePassword');
    }
    if(!result){
      req.flash('success', 'Invalid Current Password');
      return res.status(400).redirect('/user/changePassword');
    }

    bcrypt.genSalt(10, (err, salt) => {
      if(err){
        req.flash('success', 'Something went wrong');
        return res.status(502).redirect('/user/changePassword');
      }
      bcrypt.hash(confirm, salt, async (err, hash) => {
        if(err){
          req.flash('success', 'Something went wrong');
          return res.status(502).redirect('/user/changePassword');
        }
        user.password = hash;
        await user.save();
        req.flash('error', 'Password changed sucessfully, Login Again');
        return res.status(201).redirect('/user/logout');
      })
    })

  })

  console.log(user);
})

router.get('/editProfile', isLoggedIn, (req, res) => {
  res.render('updateProfile');
})

router.get('/orders/:id', isLoggedIn, async (req, res) => {
  const id = req.params.id;
  const user = req.user;
  user.orders.push(id);
  let ans = user.cartItems.findIndex(item => item.toString() === id);
  user.cartItems.splice(ans, 1);
  await user.save();
  user.populate('orders');
  let success = req.flash('success') || '';
  res.redirect('/user/orders');
})

router.get('/orders', isLoggedIn, async (req, res) => {
  let user = req.user;
  let success = req.flash('success') || '';
  await user.populate('orders');
  res.render('orders', {user, success}); 
})

router.get('/cancel/:id', isLoggedIn, async (req, res) => {
  const id = req.params.id;
  let user = req.user;
  let ans = user.orders.findIndex(item => item.toString() === id);
  user.orders.splice(ans, 1);
  await user.save();
  req.flash('success', 'Removed');
  res.redirect('/user/orders');
})

router.post('/updateProfile', upload.single('image'), isLoggedIn, async (req, res) => {
  let { fullname, email, contact } = req.body;

  let user = await userModel.findById(req.user._id); // Fetch fresh user from DB
  if (!user) {
    req.flash('error', 'User not found. Please log in again.');
    return res.redirect('/login');
  }

  user.fullname = fullname;
  user.email = email;
  user.contact = contact;
  if(req.file && req.file.buffer){
    user.image = req.file.buffer;
  }
  await user.save();

  const token = generateToken(user);
  res.cookie('token', token);

  res.redirect('/user/profile'); // Ensure profile reloads correctly
});

router.get('/add/:id', isLoggedIn, async (req, res) => {
  const id = req.params.id;
  const user = await userModel.findOne({ _id: req.user._id }).populate('cartItems');

  for (let item of user.cartItems) { 
    if (item._id.toString() === id) {
      if (item.quantity === 10) {
        req.flash('success', 'Cannot order more than 10');
        return res.redirect('/user/cart');
      }
      item.quantity += 1;
      await item.save(); 
      return res.redirect('/user/cart');
    }
  }

  return res.redirect('/user/cart');
});

router.get('/sub/:id', isLoggedIn, async (req, res) => {
  const id = req.params.id;
  const user = await userModel.findOne({ _id: req.user._id }).populate('cartItems');

  for (let item of user.cartItems) { 
    if (item._id.toString() === id) {
      if (item.quantity === 1) {
        req.flash('success', 'Cart quantity cannot be 0');
        return res.redirect('/user/cart');
      }
      item.quantity -= 1;
      await item.save(); 
      return res.redirect('/user/cart');
    }
  }

  return res.redirect('/user/cart');
});


module.exports = router;