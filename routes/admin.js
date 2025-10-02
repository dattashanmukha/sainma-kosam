const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middleware/auth'); // Security
const Review = require('../models/Review'); // Review Model
const multer = require('multer'); // For file uploads
const path = require('path'); // For file paths
const fs = require('fs'); // For file deletion during update/delete

// --- Multer Configuration ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '..', 'public', 'images'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });
// -----------------------------

router.use(isLoggedIn); 

// Base Redirect
router.get('/', (req, res) => {
    res.redirect('/admin/dashboard');
});

// [R]ead - The Admin Dashboard (List all reviews)
router.get('/dashboard', async (req, res) => {
    try {
        const reviews = await Review.find({}).sort({ datePosted: -1 });
        res.render('admin/dashboard', { reviews, error: null }); 
    } catch (e) {
        console.error("Error fetching reviews for dashboard:", e);
        res.render('admin/dashboard', { reviews: [], error: 'Could not load reviews due to a database error.' });
    }
});

// [C]reate - New Review Form (GET)
router.get('/reviews/new', (req, res) => {
    res.render('admin/write', { review: null, title: 'Create New Review', error: null });
});

// [C]reate - Handle New Review Submission (POST)
router.post('/reviews', upload.single('image'), async (req, res) => {
    try {
        const imageUrl = req.file ? `/images/${req.file.filename}` : null;
        const reviewData = { ...req.body, image: imageUrl };
        
        const newReview = new Review(reviewData);
        await newReview.save();
        
        console.log(`✅ SUCCESS: New review created: ${newReview.title}`); 
        res.status(303).redirect('/admin/dashboard');

    } catch (e) {
        console.error("❌ ERROR SAVING REVIEW:", e);
        let errorMessage = 'Validation failed. Check required fields.';
        if (e.name === 'ValidationError') {
            errorMessage = Object.values(e.errors).map(val => val.message).join('; ');
        }
        res.render('admin/write', { review: req.body, title: 'Create New Review', error: errorMessage });
    }
});


// [U]pdate - Edit Review Form (GET) - LOADS THE DATA (FIXED)
router.get('/reviews/edit/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const review = await Review.findById(id);

        if (!review) {
            return res.render('admin/dashboard', { reviews: [], error: 'Review not found for editing.' });
        }
        
        // Renders the same form but passes the existing 'review' object
        res.render('admin/write', { review, title: `Edit: ${review.title}`, error: null });
    } catch (e) {
        console.error("Error loading review for edit:", e);
        res.render('admin/dashboard', { reviews: [], error: 'Database error loading review.' });
    }
});


// [U]pdate - Handle Edit Submission (PUT) - SAVES THE CHANGES (FIXED)
router.put('/reviews/:id', upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        const reviewData = { ...req.body };
        
        // Handle new image upload
        if (req.file) {
            const oldReview = await Review.findById(id);
            // Clean up the old image file 
            if (oldReview && oldReview.image) {
                const oldImagePath = path.join(__dirname, '..', 'public', oldReview.image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            reviewData.image = `/images/${req.file.filename}`;
        }
        
        const updatedReview = await Review.findByIdAndUpdate(id, reviewData, { new: true, runValidators: true });

        if (!updatedReview) {
            return res.redirect('/admin/dashboard');
        }

        console.log(`Review updated: ${updatedReview.title}`);
        res.redirect('/admin/dashboard');

    } catch (e) {
        console.error("Error updating review:", e);
        let errorMessage = 'Validation failed during update. Check required fields.';
        if (e.name === 'ValidationError') {
            errorMessage = Object.values(e.errors).map(val => val.message).join('; ');
        }
        res.render('admin/write', { review: req.body, title: 'Editing Review', error: errorMessage });
    }
});


// [D]elete - Action (DELETE) - REMOVES REVIEW AND IMAGE (FIXED)
router.delete('/reviews/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // 1. Find the review to get the image path
        const reviewToDelete = await Review.findById(id);

        if (reviewToDelete && reviewToDelete.image) {
            // 2. Delete the image file from the server
            const imagePath = path.join(__dirname, '..', 'public', reviewToDelete.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
                console.log(`Deleted file: ${reviewToDelete.image}`);
            }
        }
        
        // 3. Delete the document from the database
        await Review.findByIdAndDelete(id);

        console.log(`Review permanently terminated: ${id}`);
        res.redirect('/admin/dashboard');

    } catch (e) {
        console.error("Error deleting review:", e);
        res.redirect('/admin/dashboard');
    }
});


module.exports = router;