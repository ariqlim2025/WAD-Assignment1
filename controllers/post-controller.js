const Post      = require('../models/post');
const User      = require('../models/user');
const Community = require('../models/community');
const Comment   = require('../models/comment');
const Vote      = require('../models/vote');
const Bookmark  = require('../models/bookmark');

const fs = require('fs/promises');
const path = require('path');

// Controller function to list home page with all posts
exports.showPosts = async (req, res) => {
    // // Load JSON data (To switch to MongoDB later, will remove this)
    // const users = JSON.parse(await fs.readFile(path.join(__dirname, '../data/users.json')));
    // const posts = JSON.parse(await fs.readFile(path.join(__dirname, '../data/posts.json')));
    // const comments = JSON.parse(await fs.readFile(path.join(__dirname, '../data/comments.json')));
    // const votes = JSON.parse(await fs.readFile(path.join(__dirname, '../data/votes.json')));
    
    // Get data from the database
    const posts = await Post.find().populate('authorId').populate('communityId');
    const comments = await Comment.find().lean();
    const votes = await Vote.find().lean();
    // console.log(posts);
    // console.log('here');
    // console.log(comments);

    // For each post, attach the author and count its comment and (upvotes - downvotes)
    for (let i=0; i < posts.length; i++) {
        // Find the user whose _id mathces the post's authors ID
        posts[i].author = posts[i].authorId;
        // Count how many comments belong to this post
        let count = 0;
        for (let k = 0; k < comments.length; k++) {
            if (comments[k].postId === posts[i]._id) {
                count++;
            }
        }
        posts[i].commentCount = count;

        // Count how many upvotes and downvotes the post has
        let score = 0;
        for (let v = 0; v < votes.length; v++) {
            if (votes[v].postId.toString() === posts[i]._id.toString()) {
                score += votes[v].value;
            }
        }
        posts[i].score = score;
    }
    
    // Sort the posts object by vote score, highest at the top 
    function compareByScore(a,b) {
        return b.score - a.score;
    }
    posts.sort(compareByScore);
    // console.log(posts);


    const currentUserId = '69bf916c4e7188eacfdc67a6'; // hardcoded, swap to req.session.user_id once auth finish
    if (currentUserId) {
        // Figure out which posts did the user upvote or downvote and add to the posts dict
        for (let i = 0; i < posts.length; i++) {
            posts[i].userVote = 0;
            for (let v=0; v < votes.length; v++) {
                if ((votes[v].postId.toString() === posts[i]._id.toString()) && (votes[v].userId.toString() === currentUserId)) {
                    posts[i].userVote = votes[v].value;
                    break;
                }
            }
        }
    }
    else {
        // If user is not logged in, set all posts' userVote to 0
        for (let i = 0; i < posts.length; i++) {
            posts[i].userVote = 0;
        }
    }

    // Render the home page
    res.render('home', {
        // Pass in all the posts data (posts + comments + author)
        posts: posts,
        user_id: 'u001'
    })
    // console.log(posts);
}