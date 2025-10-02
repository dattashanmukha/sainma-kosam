const express = require('express');
const router = express.Router();
const Review = require('../models/Review'); // Your Review Model

// [R]ead - Single Review Page: /reviews/:slug
router.get('/:slug', async (req, res) => {
    try {
        // Use the slug from the URL parameters to find the matching review
        const review = await Review.findOne({ slug: req.params.slug });
        
        if (!review) {
            // If no review is found, render a 404 page (or a custom error message)
            return res.status(404).render('404', { title: 'Review Not Found' });
        }
        
        // Render the new 'single_review.ejs' view, passing the full review object
        res.render('single_review', { title: review.title, review });

    } catch (e) {
        console.error("Error fetching single review:", e);
        res.status(500).send("Database Error while loading review.");
    }
});

module.exports = router;