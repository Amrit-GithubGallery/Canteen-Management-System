const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcrypt');
const path = require('path');
const User = require('./models/User');
const Booking = require('./models/Booking');
const Feedback = require('./models/Feedback');
const app = express();

// ✅ Database Connection
mongoose.connect('mongodb://127.0.0.1:27017/annapurnaDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => console.log('❌ MongoDB connection error:', err));

// ✅ Middleware
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Important for JSON requests like booking
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'drdo-secret',
  resave: false,
  saveUninitialized: true
}));


app.get('/index', (req, res) => {
  if (!req.session.user) return res.redirect('/auth');
  const success = req.query.success;
  res.render('index', { user: req.session.user, success });
});

// Auth Page (Login & Signup form page)
app.get('/', (req, res) => {
  res.render('auth', { error: '' });
});

// Signup Logic
app.post('/signup', async (req, res) => {
  const { name, employeeId, password, employeeType } = req.body;

  if (!name || !employeeId || !password || !employeeType) {
    return res.render('auth', { error: 'Please fill all fields.' });
  }

  try {
    const existingUser = await User.findOne({ employeeId });
    if (existingUser) {
      return res.render('auth', { error: 'Employee ID already registered. Please login.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      employeeId,
      password: hashedPassword,
      employeeType
    });

    await newUser.save();
    res.redirect('/');
  } catch (err) {
    console.log(err);
    res.render('auth', { error: 'An error occurred. Please try again.' });
  }
});

// Login Logic
app.post('/login', async (req, res) => {
  const { employeeId, password } = req.body;

  try {
    const user = await User.findOne({ employeeId });

    if (!user) {
      return res.render('auth', { error: 'Invalid Employee ID.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.render('auth', { error: 'Incorrect Password.' });
    }

    req.session.user = {
      _id: user._id,   // ✅ Store _id to use when saving bookings
      name: user.name,
      employeeId: user.employeeId,
      employeeType: user.employeeType
    };

    res.redirect('/index');
  } catch (err) {
    console.log(err);
    res.render('auth', { error: 'An error occurred. Please try again.' });
  }
});

// Menu Page
app.get('/menu', (req, res) => {
  if (!req.session.user) return res.redirect('/auth');
  res.render('menu', { user: req.session.user });
});

// ✅ Booking Route — Save when Proceed to Payment is clicked
app.post('/book', (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: 'Unauthorized' });

  const { items, total } = req.body;

    const booking = new Booking({
    user: {
      name: req.session.user.name,
      employeeId: req.session.user.employeeId
    },
    items,
    total
  });
  booking.save()
    .then(() => res.json({ message: 'Booking successful!' }))
    .catch(err => {
      console.error('Booking failed:', err);
      res.status(500).json({ message: 'Booking failed!' });
    });
});
//showing booking item
app.get('/booking', async (req, res) => {
  if (!req.session.user) return res.redirect('/auth');

  try {
    const bookings = await Booking.find({ 'user.employeeId': req.session.user.employeeId });
    res.render('booking', { user: req.session.user, bookings });
  } catch (err) {
    console.log(err);
    res.render('booking', { user: req.session.user, bookings: [] });
  }
});

// GET Contact Page
app.get('/contact', (req, res) => {
  res.render('contact');
});

// POST Feedback Form
app.post('/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;

  try {
    const newFeedback = new Feedback({ name, email, subject, message });
    await newFeedback.save();
    res.redirect('/contact?success=1');
  } catch (err) {
    console.error('Error saving feedback:', err);
    res.redirect('/contact?error=1');
  }
});


// Logout
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// ✅ Start Server
const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
