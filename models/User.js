// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    // The username you and your friend will use to log in
    username: {
        type: String,
        required: [true, 'Username is required'], // Added validation message
        unique: true,
        trim: true // Removes whitespace
    },
    // The password will be stored here, securely hashed
    password: {
        type: String,
        required: [true, 'Password is required'],
    },
    // Optional: Keep track of when the account was created
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

/**
 * Mongoose Middleware: Hash the password before saving the user document.
 * * NOTE: 'pre' ensures this runs right before a user is saved (e.g., when you first create the admin account).
 * 'isModified' ensures we don't re-hash an already hashed password when updating other user fields.
 */
UserSchema.pre('save', async function(next) {
    // Only run this function if the password field was modified (or is new)
    if (!this.isModified('password')) {
        return next();
    }
    
    // Generate a salt (the randomization factor)
    const salt = await bcrypt.genSalt(12); // 12 rounds is very secure
    
    // Hash the password
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

/**
 * Custom Instance Method: Compares the plain-text password provided during login
 * with the hashed password stored in the database.
 */
UserSchema.methods.comparePassword = function(candidatePassword) {
    // bcrypt.compare() is synchronous in this context, returns true or false
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);