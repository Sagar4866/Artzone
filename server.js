// ============================================
// ARTZONE ECO-ART MARKETPLACE - SERVER.JS
// Production-Ready Backend Server
// ============================================

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

const app = express();

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from root, js, and css folders
app.use(express.static(path.join(__dirname)));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// ============================================
// DATABASE CONNECTION
// ============================================
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'your-mongodb-connection-string', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

connectDB();

// ============================================
// DATABASE SCHEMAS
// ============================================

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, enum: ['user', 'artist', 'admin'], default: 'user' },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Artwork' }],
  cart: [{
    artwork: { type: mongoose.Schema.Types.ObjectId, ref: 'Artwork' },
    quantity: { type: Number, default: 1 }
  }],
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

// Artist Schema
const artistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  bio: { type: String, required: true },
  specialty: { 
    type: String, 
    required: true,
    enum: ['plastic', 'textile', 'metal', 'paper', 'e-waste', 'organic', 'general']
  },
  image: { type: String, default: '/images/default-artist.jpg' },
  rating: { type: Number, default: 4.5, min: 0, max: 5 },
  followers: { type: Number, default: 0 },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  socialMedia: {
    instagram: String,
    facebook: String,
    website: String
  },
  createdAt: { type: Date, default: Date.now }
});

const Artist = mongoose.model('Artist', artistSchema);

// Artwork Schema
const artworkSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  artist: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist', required: true },
  images: [{ type: String }],
  price: { type: Number, required: true, min: 0 },
  category: { 
    type: String, 
    required: true,
    enum: ['sculpture', 'painting', 'installation', 'furniture', 'jewelry', 'textile', 'other']
  },
  materials: [String],
  availability: { 
    type: String, 
    enum: ['available', 'sold', 'reserved'], 
    default: 'available' 
  },
  featured: { type: Boolean, default: false },
  likes: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const Artwork = mongoose.model('Artwork', artworkSchema);

// Event Schema
const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['workshop', 'exhibition', 'virtual', 'competition'], 
    required: true 
  },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  location: { type: String, required: true },
  image: String,
  registrationRequired: { type: Boolean, default: false },
  maxParticipants: Number,
  registeredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  price: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const Event = mongoose.model('Event', eventSchema);

// Blog Schema
const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  image: String,
  tags: [String],
  published: { type: Boolean, default: true },
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const Blog = mongoose.model('Blog', blogSchema);

// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================
const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ status: 'error', message: 'Not authorized' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
    req.user = await User.findById(decoded.id);
    
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'User not found' });
    }

    next();
  } catch (error) {
    res.status(401).json({ status: 'error', message: 'Invalid token' });
  }
};

// ============================================
// HELPER FUNCTION - Generate JWT
// ============================================
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key-change-in-production', {
    expiresIn: '30d'
  });
};

// ============================================
// ROUTES - AUTHENTICATION
// ============================================

// Register/Signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ status: 'error', message: 'User already exists' });
    }

    const user = await User.create({ name, email, password, role: role || 'user' });
    const token = generateToken(user._id);

    res.status(201).json({
      status: 'success',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: 'error', message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      status: 'success',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Get Current User
app.get('/api/auth/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('favorites').populate('cart.artwork');
    res.status(200).json({ status: 'success', user });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// ============================================
// ROUTES - ARTISTS
// ============================================

// Get All Artists
app.get('/api/artists', async (req, res) => {
  try {
    const { specialty, sortBy } = req.query;
    let query = {};
    
    if (specialty) query.specialty = specialty;

    let artists = Artist.find(query);

    if (sortBy === 'rating') {
      artists = artists.sort({ rating: -1 });
    } else if (sortBy === 'followers') {
      artists = artists.sort({ followers: -1 });
    } else {
      artists = artists.sort({ createdAt: -1 });
    }

    const results = await artists;
    res.status(200).json({ status: 'success', count: results.length, data: results });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Get Single Artist
app.get('/api/artists/:id', async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id).populate('user', 'name email');
    
    if (!artist) {
      return res.status(404).json({ status: 'error', message: 'Artist not found' });
    }

    const artworks = await Artwork.find({ artist: req.params.id });
    
    res.status(200).json({ status: 'success', data: { ...artist.toObject(), artworks } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Create Artist Profile
app.post('/api/artists', protect, async (req, res) => {
  try {
    const artistData = { ...req.body, user: req.user.id };
    const artist = await Artist.create(artistData);
    res.status(201).json({ status: 'success', data: artist });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Update Artist Profile
app.put('/api/artists/:id', protect, async (req, res) => {
  try {
    const artist = await Artist.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!artist) {
      return res.status(404).json({ status: 'error', message: 'Artist not found' });
    }

    res.status(200).json({ status: 'success', data: artist });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// ============================================
// ROUTES - ARTWORKS
// ============================================

// Get All Artworks
app.get('/api/artworks', async (req, res) => {
  try {
    const { category, minPrice, maxPrice, featured, artist } = req.query;
    let query = {};
    
    if (category) query.category = category;
    if (featured) query.featured = featured === 'true';
    if (artist) query.artist = artist;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const artworks = await Artwork.find(query)
      .populate('artist', 'name specialty image')
      .sort({ createdAt: -1 });

    res.status(200).json({ status: 'success', count: artworks.length, data: artworks });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Get Single Artwork
app.get('/api/artworks/:id', async (req, res) => {
  try {
    const artwork = await Artwork.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('artist', 'name specialty image bio');

    if (!artwork) {
      return res.status(404).json({ status: 'error', message: 'Artwork not found' });
    }

    res.status(200).json({ status: 'success', data: artwork });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Create Artwork
app.post('/api/artworks', protect, async (req, res) => {
  try {
    const artwork = await Artwork.create(req.body);
    res.status(201).json({ status: 'success', data: artwork });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Update Artwork
app.put('/api/artworks/:id', protect, async (req, res) => {
  try {
    const artwork = await Artwork.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!artwork) {
      return res.status(404).json({ status: 'error', message: 'Artwork not found' });
    }

    res.status(200).json({ status: 'success', data: artwork });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Delete Artwork
app.delete('/api/artworks/:id', protect, async (req, res) => {
  try {
    const artwork = await Artwork.findByIdAndDelete(req.params.id);

    if (!artwork) {
      return res.status(404).json({ status: 'error', message: 'Artwork not found' });
    }

    res.status(200).json({ status: 'success', message: 'Artwork deleted' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// ============================================
// ROUTES - EVENTS
// ============================================

// Get All Events
app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find({ date: { $gte: new Date() } }).sort({ date: 1 });
    res.status(200).json({ status: 'success', count: events.length, data: events });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Get Single Event
app.get('/api/events/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('registeredUsers', 'name email');
    
    if (!event) {
      return res.status(404).json({ status: 'error', message: 'Event not found' });
    }

    res.status(200).json({ status: 'success', data: event });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Create Event
app.post('/api/events', protect, async (req, res) => {
  try {
    const event = await Event.create(req.body);
    res.status(201).json({ status: 'success', data: event });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Register for Event
app.post('/api/events/:id/register', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ status: 'error', message: 'Event not found' });
    }

    if (event.registeredUsers.includes(req.user.id)) {
      return res.status(400).json({ status: 'error', message: 'Already registered' });
    }

    if (event.maxParticipants && event.registeredUsers.length >= event.maxParticipants) {
      return res.status(400).json({ status: 'error', message: 'Event is full' });
    }

    event.registeredUsers.push(req.user.id);
    await event.save();

    res.status(200).json({ status: 'success', message: 'Registered successfully', data: event });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// ============================================
// ROUTES - BLOGS
// ============================================

// Get All Blogs
app.get('/api/blogs', async (req, res) => {
  try {
    const blogs = await Blog.find({ published: true })
      .populate('author', 'name email')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ status: 'success', count: blogs.length, data: blogs });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Get Single Blog
app.get('/api/blogs/:id', async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('author', 'name email');

    if (!blog) {
      return res.status(404).json({ status: 'error', message: 'Blog not found' });
    }

    res.status(200).json({ status: 'success', data: blog });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Create Blog
app.post('/api/blogs', protect, async (req, res) => {
  try {
    const blogData = { ...req.body, author: req.user.id };
    const blog = await Blog.create(blogData);
    res.status(201).json({ status: 'success', data: blog });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// ============================================
// ROUTES - USER CART & FAVORITES
// ============================================

// Add to Cart
app.post('/api/cart', protect, async (req, res) => {
  try {
    const { artworkId, quantity } = req.body;
    
    const user = await User.findById(req.user.id);
    const existingItem = user.cart.find(item => item.artwork.toString() === artworkId);

    if (existingItem) {
      existingItem.quantity += quantity || 1;
    } else {
      user.cart.push({ artwork: artworkId, quantity: quantity || 1 });
    }

    await user.save();
    await user.populate('cart.artwork');

    res.status(200).json({ status: 'success', data: user.cart });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Get Cart
app.get('/api/cart', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('cart.artwork');
    res.status(200).json({ status: 'success', data: user.cart });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Remove from Cart
app.delete('/api/cart/:artworkId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.cart = user.cart.filter(item => item.artwork.toString() !== req.params.artworkId);
    await user.save();

    res.status(200).json({ status: 'success', data: user.cart });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Add to Favorites
app.post('/api/favorites/:artworkId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (user.favorites.includes(req.params.artworkId)) {
      return res.status(400).json({ status: 'error', message: 'Already in favorites' });
    }

    user.favorites.push(req.params.artworkId);
    await user.save();
    await user.populate('favorites');

    res.status(200).json({ status: 'success', data: user.favorites });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Get Favorites
app.get('/api/favorites', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('favorites');
    res.status(200).json({ status: 'success', data: user.favorites });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Remove from Favorites
app.delete('/api/favorites/:artworkId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.favorites = user.favorites.filter(id => id.toString() !== req.params.artworkId);
    await user.save();

    res.status(200).json({ status: 'success', data: user.favorites });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// ============================================
// SERVE HTML FILES
// ============================================
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/artists', (req, res) => res.sendFile(path.join(__dirname, 'artist.html')));
app.get('/gallery', (req, res) => res.sendFile(path.join(__dirname, 'gallery.html')));
app.get('/events', (req, res) => res.sendFile(path.join(__dirname, 'event.html')));
app.get('/blog', (req, res) => res.sendFile(path.join(__dirname, 'blog.html')));
app.get('/discover', (req, res) => res.sendFile(path.join(__dirname, 'discover.html')));
app.get('/profile', (req, res) => res.sendFile(path.join(__dirname, 'profile.html')));
app.get('/cart', (req, res) => res.sendFile(path.join(__dirname, 'cart.html')));
app.get('/favorites', (req, res) => res.sendFile(path.join(__dirname, 'fav.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'login.html')));
app.get('/waste-to-art', (req, res) => res.sendFile(path.join(__dirname, 'wastetoart.html')));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'success', 
    message: 'Artzone Server is running',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Route not found' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error'
  });
});

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║   🎨 ARTZONE SERVER RUNNING 🎨        ║
╠═══════════════════════════════════════╣
║  Port: ${PORT}                         ║
║  Frontend: http://localhost:${PORT}   ║
║  API: http://localhost:${PORT}/api    ║
║  Environment: ${process.env.NODE_ENV || 'development'}           ║
╚═══════════════════════════════════════╝
  `);
});
