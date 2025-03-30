const userModel = require('../model/user.model');
const bcrypt = require('bcrypt');
const genToken = require('../config/generateToken');
const ownerModel = require('../model/owner.model');

module.exports.registerUser = async (req, res) => {
  let{fullname, email, password} = req.body;

  if(!fullname || !email || !password){
    req.flash('error', 'All field are required');
    return res.status(404).redirect('/');
  }

  let owner = await ownerModel.findOne({email});
  if(owner){
    req.flash('error', 'Email registered as Admin');
    return res.status(403).redirect('/');
  }

  const existingUser = await userModel.findOne({ email });
  if (existingUser){
    req.flash('error', 'User already exists, Try logIn');
    return res.status(403).redirect('/');
  }

  try {
    bcrypt.genSalt(10, async (err, salt) => {
      if(err){
        req.flash('error', 'Something went wrong, Try again')
        return res.status(500).redirect('/');
      }
      bcrypt.hash(password, salt, async (err, hash) => {
        if(err){
          req.flash('error', 'Something went wrong, Try again')
          return res.status(500).redirect('/');
        }
        let createdUser = await userModel.create({
          fullname,
          email,
          password: hash,
        })
        const token = genToken(createdUser);
        res.cookie('token', token);
        return res.status(201).redirect('/user/shop');
      })
    })
  } catch (error) {
    req.flash('error', 'Something went wrong, Try again')
    return res.status(400).redirect('/');
  }
}

module.exports.loginUser = async (req, res) => {
  let { email, password } = req.body;

  if (!email || !password) {
    req.flash("error", "Enter Credentials");
    return res.status(404).redirect("/");
  }

  let owner = await ownerModel.findOne({ email }).populate('product');
  if (owner) {
    try {
      let result = await bcrypt.compare(password, owner.password);
      if (!result) {
        req.flash("error", "Password Incorrect");
        return res.status(401).redirect("/");
      }
      const token = genToken(owner);
      res.cookie("token", token);
      return res.status(200).render("ownershop", { products: owner.product || [] });
    } catch (err) {
      return res.status(502).send("password compare error during login");
    }
  }

  let user = await userModel.findOne({ email });
  if (!user) {
    req.flash("error", "Invalid User");
    return res.status(501).redirect("/");
  }

  try {
    let result = await bcrypt.compare(password, user.password);
    if (!result) {
      req.flash("error", "Password Incorrect");
      return res.status(401).redirect("/");
    }
    const token = genToken(user);
    res.cookie("token", token);
    return res.status(200).redirect("/user/shop");
  } catch (err) {
    return res.status(502).send("password compare error during login");
  }
};

module.exports.logout = async (req, res) => {
  res.clearCookie('token');
  res.status(201).redirect('/');
}