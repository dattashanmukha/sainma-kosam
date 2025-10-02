// middleware/auth.js

module.exports.isLoggedIn = (req, res, next) => {
    // Check if the session contains a user ID
    if (!req.session.userId) {
        
        // If they were trying to access a specific admin page (like /admin/edit/123),
        // save that URL so we can send them there after they successfully log in.
        req.session.returnTo = req.originalUrl;
        
        // Redirect them to the login page
        return res.redirect('/auth/login');
    }
    
    // Success! User is logged in. Move to the next function in the route.
    next();
};
