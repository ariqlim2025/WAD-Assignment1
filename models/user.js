// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username:     { type: String, required: true, unique: true },
    email:        { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    bio:          { type: String },
    createdAt:    { type: Date, default: Date.now },
    age:          { type: Number, required: true }
});

const User = mongoose.model('User', userSchema);

// Create user
exports.addUser = function(username, email, passwordHash, age) {
    return User.create({username, email, passwordHash, age});
}

// Read user via Email
exports.findByEmail = function(email) {
    return User.findOne({ email: { $regex: `^${email}$`, $options: 'i' }  });
}

// Read user via Username
exports.findByUsername = function(username) {
    return User.findOne({ username: { $regex: `^${username}$`, $options: 'i' } });
}

// Read user via ID
exports.findByID = function(_id) {
    return User.findOne({ _id });
}

// Update details
exports.updateDetails = function(_id, email, username, bio) {
    return User.updateOne(
        { _id },
        { $set: { email, username, bio }}
    );
}

// Update new password
exports.updatePassword = function(_id, passwordHash) {
    return User.updateOne(
        { _id },
        { $set: { passwordHash }}
    );
}

// Delete user based on ID (has to be logged in so read from session)
exports.deleteUser =  async function(_id) {
    await User.deleteOne({ _id });
}

// module.exports = User;