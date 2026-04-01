// models/Post.js
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title:       { type: String, required: true },
    content:     { type: String, required: true },
    authorId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    communityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Community' },
    createdAt:   { type: Date, default: Date.now },
    updatedAt:   { type: Date, default: Date.now }
});

const Post = mongoose.model('Post', postSchema);
exports.Post = Post;

exports.findAllPosts = () => {
    return Post.find()
}

exports.findSinglePost = (postId) => {
    return Post.findById(postId)
}

exports.findPostsByCommunity = (communityId) => {
    return Post.find({ communityId: communityId })
}

