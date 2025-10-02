const mongoose = require('mongoose');
const User = require('./models/User'); // Path to your User model
// FIX: Changed database name from sainmakosam_db to sainmakosam
const dbUrl = process.env.MONGO_URI || 'mongodb://localhost:27017/sainmakosam'; 

mongoose.connect(dbUrl)
    .then(() => {
        console.log("Database connected for seeding.");
        seedUsers();
    })
    .catch(err => {
        console.error("Database connection error:", err);
    });

const users = [
    { username: 'datta', password: 'changeMe123' }, // CHANGE THE PASSWORD!
    { username: 'pranav', password: 'friendPass456' } // CHANGE THE PASSWORD!
];

async function seedUsers() {
    try {
        // 1. Delete any existing users to prevent duplicates
        await User.deleteMany({}); 

        // 2. Create the new users. The model's pre('save') middleware will hash the passwords.
        for (let userData of users) {
            const user = new User(userData);
            await user.save();
            console.log(`✅ User created: ${user.username}`);
        }
        
        console.log("Seeding complete. Ready to log in!");
    } catch (e) {
        console.error("Error during user seeding:", e);
    } finally {
        // 3. Close the connection
        mongoose.connection.close();
    }
}
