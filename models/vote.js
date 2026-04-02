// models/Vote.js
const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    postId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    value:     { type: Number },
    createdAt: { type: Date, default: Date.now }
});

const Vote = mongoose.model('Vote', voteSchema);
// ----- Vote Methods -----
// Retrieve one vote
exports.findOneVote = function(userId, postId) {
    return Vote.findOne({ userId: userId, postId: postId }); 
}
// Update a vote
exports.updateOneVote = function(voteId, value) {
    return Vote.updateOne({ _id: voteId }, { $set: { value: value } });
}
// Delete a vote
exports.deleteOneVote = function(voteId) {
    return Vote.deleteOne({ _id: voteId });
}
// Create a vote
exports.createOneVote = function(userId, postId, value) {
    return Vote.create({ userId: userId, postId: postId, value: value });
}

exports.find = function(filter) {
    return Vote.find(filter);
}

exports.deleteMany = function(filter) {
    return Vote.deleteMany(filter);
}
