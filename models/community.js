// models/Community.js
const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema({
    name:        { type: String, required: true, unique: true },
    description: { type: String, required: true },
    createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt:   { type: Date, default: Date.now }
});

const Community = mongoose.model('Community', communitySchema);
module.exports = Community;