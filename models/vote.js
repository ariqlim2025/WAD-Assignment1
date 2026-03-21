// models/Vote.js
const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    postId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    value:     { type: Number },
    createdAt: { type: Date, default: Date.now }
});

const Vote = mongoose.model('Vote', voteSchema);
module.exports = Vote;