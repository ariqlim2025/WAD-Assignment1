const Post      = require('../models/Post');
const Community = require('../models/Community');
const Comment   = require('../models/Comment');
const Vote      = require('../models/Vote');
const Bookmark  = require('../models/Bookmark');

const fs = require('fs/promises');
const path = require('path');

// Controller function to list home page with all posts
exports.showPosts = async (req, res) => {
    // Load JSON data (To switch to MongoDB later, will remove this)
    const users = JSON.parse(await fs.readFile(path.join(__dirname, '../data/users.json')));
    const posts = JSON.parse(await fs.readFile(path.join(__dirname, '../data/posts.json')));
    const comments = JSON.parse(await fs.readFile(path.join(__dirname, '../data/comments.json')));

    // For each post, attach the author and count its comment and (upvotes - downvotes)
    for (let i=0; i < posts.length; i++) {
        // Find the user whose _id mathces the post's authors ID
        for (let j=0; j < users.length; j++) {
            if (users[j]._id === posts[i].authorId) {
                posts[i].author = users[j];
                //console.log(posts[i]);
                break;
            }
        }
        // Count how many comments belong to this post
        let count = 0;
        for (let k = 0; k < comments.length; k++) {
            if (comments[k].postId === posts[i]._id) {
                count++;
            }
        }
        posts[i].commentCount = count;
        // console.log(posts[i]);
    }

    // Render the home page
    res.render('home', {
        // Pass in all the posts data (posts + comments + author)
        posts: posts,
        username: 'TheMonster112'
    })

    
    // res.render('home', {
    //     posts: posts,
    //     username: 'TheMonster112'
    // })
}