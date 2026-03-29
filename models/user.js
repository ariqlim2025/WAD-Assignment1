// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username:     { type: String, required: true, unique: true },
    email:        { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    bio:          { type: String },
    createdAt:    { type: Date, default: Date.now },
    age:          { type: Number, required: true }
});

const User = mongoose.model('User', userSchema);

exports.findByEmail = function(email) {
    return User.findOne({ email });
}

exports.findByUsername = function(username) {
    return User.findOne({ username });
}

exports.addUser = function(username, email, passwordHash, age) {
    return User.create({username, email, passwordHash, age});
}

// module.exports = User;