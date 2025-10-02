const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Import your secure User model

// [1] GET Login Page: Renders the login form
router.get('/login', (req, res) => {
    // You can pass an error variable here if there was a failed login attempt
    res.render('login', { error: null }); 
});

// [2] POST Login Attempt: Handles the form submission
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // 1. Find the user by username
    const user = await User.findOne({ username });

    // 2. Check if user exists AND if the password matches the hash
    // We use the comparePassword method defined in your User model!
    if (!user || !(await user.comparePassword(password))) {
        // Failure: Render the login page again with an error message
        return res.render('login', { error: 'Access Denied: Invalid Username or Password.' });
    }

    // 3. Success! Log the user in
    // This creates the session cookie in the browser
    req.session.userId = user._id;

    // Optional: Redirect them to the page they were trying to reach, or default to the dashboard
    const redirectUrl = req.session.returnTo || '/admin/dashboard';
    delete req.session.returnTo; // Clean up the session
    
    // Send them to the secret clubhouse!
    res.redirect(redirectUrl); 
});

// [3] Logout Route
router.get('/logout', (req, res) => {
    // Destroy the session and redirect to the homepage
    req.session.destroy(err => {
        if (err) console.error("Error destroying session:", err);
        res.redirect('/');
    });
});

module.exports = router;
