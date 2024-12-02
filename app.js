const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('./config/passport')(passport);

const app = express();

mongoose.connect('mongodb://localhost:27017/usersystems', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.use(express.json());
app.use(session({ secret: 'my_super_secret_key_12345', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
  res.send('Welcome to the User Authentication System!');
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  console.log('Registering user:', username);
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.status(201).send('User registered');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error registering user');
  }
});

app.post('/login', (req, res, next) => {
  console.log('Attempting login for:', req.body.username);
  next();
}, passport.authenticate('local'), (req, res) => {
  res.send('Logged in successfully');
});

app.get('/logout', (req, res) => {
  req.logout(err => {
    if (err) { return next(err); }
    res.send('Logged out successfully');
  });
});

app.listen(3000, () => console.log('Server started on http://localhost:3000'));
