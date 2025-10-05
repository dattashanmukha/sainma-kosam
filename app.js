const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const session = require('express-session');
const cookieParser = require('cookie-parser'); 

// Load environment variables from .env file (must be the very first line)
require('dotenv').config(); 

const app = express();

// --- Model Imports ---
const Review = require('./models/Review'); // REQUIRED for the homepage fetch

// --- MongoDB Connection ---
const dbUrl = process.env.MONGO_URI || 'mongodb+srv://sainmakosam:sainmakosamDATABASE@reviews.b2gaqa3.mongodb.net/?retryWrites=true&w=majority&appName=reviews'; 

mongoose.connect(dbUrl)
    .then(() => {
        console.log("🚀 MongoDB connection successful! Database is online.");
    })
    .catch(err => {
        console.error("❌ MongoDB connection error:", err);
    });

// --- App Configuration ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// --- Middleware ---
app.use(express.urlencoded({ extended: true })); // To parse form bodies (req.body)
app.use(methodOverride('_method')); // For handling PUT/DELETE requests from forms
app.use(express.static(path.join(__dirname, 'public'))); // Serve static assets

// 1. Cookie Parser 
app.use(cookieParser());

// 2. Session Setup
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_fallback_secret_key_very_long', // Uses env variable
    resave: false,
    saveUninitialized: false, 
    cookie: { 
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week session lifespan
        httpOnly: true, 
    } 
}));

// --- Route Imports ---
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin'); 
const reviewsRoutes = require('./routes/reviews'); // You will build this one next

// --- Register Routes ---
app.use('/auth', authRoutes); 
app.use('/admin', adminRoutes); 
app.use('/reviews', reviewsRoutes); // Register public routes here once built


// --- Public Routes ---

// 1. Root Route (Splash Screen)
app.get('/', async (req, res) => {
    // Renders the splash screen (start.ejs)
    res.render('start'); 
});

// 2. Dashboard Route (Main Review List - Fetches Data)
// FIX: Now renders 'home.ejs'
app.get('/dashboard', async (req, res) => {
    try {
        const reviews = await Review.find({})
            .sort({ datePosted: -1 })
            .limit(10); 
        // This is the main page that renders the list of reviews
        res.render('home', { title: 'Sainma Kosam', reviews: reviews });
        
    } catch (e) {
        console.error("Error fetching reviews for homepage:", e);
        res.render('home', { title: 'Sainma Kosam', reviews: [] });
    }
});


app.get('/why', (req, res) => {
    res.render('why');
});

app.get('/contact', (req, res) => {
    res.render('contact');
});

// --- Server Listener ---
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port} - Go cause some chaos!`);
});
