// models/Post.js
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title:       { type: String, required: [true, "Title is mandatory"]},
    content:     { type: String, required: true },
    authorId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    communityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Community' },
    createdAt:   { type: Date, default: Date.now },
    updatedAt:   { type: Date, default: Date.now }
});

const Post = mongoose.model('Post', postSchema);
exports.find = function(filter) {
    return Post.find(filter);
}

exports.findById = function(postId) {
    return Post.findById(postId);
}

exports.findSinglePost = function(postId) {
    return Post.findById(postId);
}

exports.createPost = function(newPost) {
    return Post.create(newPost);
}

exports.updatePostContent = function(_id, title, content) {
    return Post.updateOne(
        { _id },
        { $set: { title, content, updatedAt }}
    );
}

exports.deleteMany = function(filter) {
    return Post.deleteMany(filter);
}

exports.findByIdAndDelete = function(postId) {
    return Post.findByIdAndDelete(postId);
}

