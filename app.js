const CookieParser = require('cookie-parser');
const express = require('express');
const path = require('path');
const mongooseConnection = require('./config/mongooseConnection');
const userRouter = require('./routes/userRouter');
const ownerRouter = require('./routes/ownerRouter');
const productRouter = require('./routes/productRouter')
const Router = require('./routes/index');
const session = require('express-session');
const flash = require('connect-flash');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(CookieParser());
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: process.env.EXPRESS_SESSION_SECRET,
}))
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.use('/', Router);
app.use('/owner', ownerRouter);
app.use('/user', userRouter);
app.use('/product', productRouter);

app.listen(port, () => {
  console.log(`Server is running at port ${port}`);
})