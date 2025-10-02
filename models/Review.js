const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the blueprint for a single movie review document
const ReviewSchema = new Schema({
    // The main title of the movie/series and post
    title: {
        type: String,
        required: [true, 'Every review needs a title!'],
        maxlength: [100, 'Title is too long, keep it under 100 characters.']
    },
    // The short summary used on the main blog grid
    excerpt: {
        type: String,
        required: [true, 'An excerpt is required for the main page display.'],
        maxlength: [250, 'Excerpt should be short and punchy (max 250 chars).']
    },
    // The full, chaotic text of the review
    content: {
        type: String,
        required: [true, 'The review body cannot be empty.']
    },
    // The author (either you or your friend)
    author: {
        type: String,
        required: [true, 'We gotta know who wrote this chaos!'],
        enum: ['Datta', 'Friend', 'Guest'], // Enforce specific authors for consistency
    },
    // URL for the featured image (poster)
    image: {
        type: String,
        default: 'https://placehold.co/800x400/1C1C1C/FFFFFF?text=Poster+Image' // Default placeholder
    },
    // Timestamp for sorting reviews
    datePosted: {
        type: Date,
        default: Date.now
    },
    // Optional: A unique slug for clean URLs (e.g., /reviews/rrr-fire-and-water)
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    }
});

// Middleware to automatically generate the slug before saving
ReviewSchema.pre('save', function(next) {
    if (this.isModified('title') || !this.slug) {
        this.slug = this.title.toLowerCase()
                              .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric chars
                              .trim()
                              .replace(/\s+/g, '-'); // Replace spaces with dashes
    }
    next();
});

module.exports = mongoose.model('Review', ReviewSchema);
