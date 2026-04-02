const { Post, findSinglePost }      = require('../models/post');
const User      = require('../models/user');
const Community = require('../models/community');
const { Comment, addComment, removeComment } = require('../models/comment');
const { Vote, retrieveAllVotes } = require('../models/vote');
const Bookmark  = require('../models/bookmark');

// Controller function to list home page with all posts
exports.showPosts = async (req, res) => {
    try {
        // Get data from the database
        const postId = req.query.id; // get id from URL
        const currentUserId = '69bf916c4e7188eacfdc67a6' // hardcoded, swap to req.session.user_id once auth finish

        // find a specific post and populate author details 
        //const communities = await Community.find().lean();

        const communities = [
        { _id: '650000000000000000000001', name: 'javascript' },
        { _id: '650000000000000000000002', name: 'webdev' },
        { _id: '650000000000000000000003', name: 'funny' }
        ]

        if (postId){
            const post = await Post.findById(postId).populate('authorId');

            if (!post) {
                return res.send("Post not found");
            }
            // pass currentUserId so that EJS
            return res.render('posts', {
                post:post,
                communityList:communities,
                currentUserId: currentUserId
            });
        }

        const posts = await Post.find().populate('authorId');
        const comments = await Comment.find().lean();
        const votes = await Vote.find().lean();

        // For each post, attach the author and count its comment and (upvotes - downvotes)
        for (let i=0; i < posts.length; i++) {
        // Find the user whose _id matches the post's authors ID
        posts[i].author = posts[i].authorId 
        // Count how many comments belong to this post
        let count = 0;
        for (let k = 0; k < comments.length; k++) {
            // if comment postid is the same as postid, +1 to the count of the comment 
            if (comments[k].postId === posts[i]._id) {
                count++;
            }
        }
        posts[i].commentCount = count;

        // Count how many upvotes and downvotes the post has
        let score = 0;
        for (let v = 0; v < votes.length; v++) {
            // if votes postid is the same as postid, +1 or -1 to the count of the votes 
            if (votes[v].postId.toString() === posts[i]._id.toString()) {
                // add or minus from the score according to if the votes.value is +1 or -1 
                score += votes[v].value;
            }
        }
        // display the score
        posts[i].score = score;
    }
    
        // Create a function to sort the posts object by vote score, highest at the top 
        function compareByScore(a,b) {
            return b.score - a.score;
        }
        posts.sort(compareByScore);
        // console.log(posts);


        if (currentUserId) {
            // Figure out which posts did the user upvote or downvote and add to the posts dict
            // check if the user upvote, downvote or never vote
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
            user_id: 'u001',
            communityList: communities,
            currentUserId: currentUserId
        })
        // console.log(posts);
        } catch (err) {
        console.error(err);
        res.send("Error loading posts")
        }
    };

//create post

exports.showCreatePage = (req, res) => {
    const communities = [
        { _id: '650000000000000000000001', name: 'javascript' },
        { _id: '650000000000000000000002', name: 'webdev' },
        { _id: '650000000000000000000003', name: 'funny' }
    ];
    res.render('posts', { post: null, communityList: communities });
};

// ensure that the post is with the correct inputs
exports.validatepost = async(req,res) => {
    try {
        // get data sent from HTML form
        const {title, content,communityId} = req.body;

        const currentUserId = '69bf916c4e7188eacfdc67a6'

        //Create a new post object using the MongoDB schema 
        const newPost = new Post({
            title: title, //post title
            content: content, // post content
            authorId : currentUserId, // who created post
            communityId: communityId || null // optional, can be null
        });

        // save post into mongodb
        await newPost.save();

        // after saving, redirect to homepage and go back to the homepage
        res.redirect('/?message=Post created successfully!');
    } catch(err){
        // if any error happens show error message and go back to the create page
        console.error(err);
        res.send('/create?message=Error creating post');
    }
};

// update post 

exports.updatePost = async(req,res) => {
    try {
        const {postId, title, content } = req.body;

        const currentUserId = '69bf916c4e7188eacfdc67a6';

        const post = await Post.findById(postId);

        if (!post){
            return res.send('Post not found');
        }

        if (post.authorId.toString() !== currentUserId) {
            return res.send('Unauthorized');
        }


    post.title = title;
    post.content = content;
    post.updatedAt = new Date();

    await post.save();
    
    res.redirect('/');

} catch(err) {
    console.error(err);
    res.send('Error updating post');
    }
};

//delete post
exports.deletePost = async(req,res) => {
    try {
        const {postId} = req.body;
        const post = await Post.findById(postId);
        const currentUserId = '69bf916c4e7188eacfdc67a6'

        // authenticate
        if (!post) {
            return res.send("Post not found");
        }

        if (post.authorId.toString() !== currentUserId.toString()){
            return res.send("Unauthorized: You cannot delete posts that do not belong to you")
        }

        await Post.findByIdAndDelete(postId);
        res.redirect('/');

    } catch (err) {
        console.error(err);
        res.send("Error deleting post. Please try again.");
    }
};