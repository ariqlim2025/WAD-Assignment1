const Post = require('../models/post');
const Comment = require('../models/comment');
const Vote = require('../models/vote');


// ------------ CONTROLLLER FUNCTION TO SHOW ALL POSTS ------------
exports.showPosts = async (req, res) => {
    
    // Get data from the database
    const posts = await Post.findAllPosts().populate('authorId').populate('communityId');
    const comments = await Comment.findAllComments().lean();
    const votes = await Vote.retrieveAllVotes().lean();

    // For each post, attach the author and count its comment and (upvotes - downvotes)
    for (let i=0; i < posts.length; i++) {
        // Find the user whose _id mathces the post's authors ID
        posts[i].author = posts[i].authorId;

        // Count how many comments belong to this post
        let count = 0;
        for (let k = 0; k < comments.length; k++) {
            if (comments[k].postId.toString() === posts[i]._id.toString()) {
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

    // Get the current user ID from the session (else it would be null)
    const currentUserId = req.session.user?.user_id || null;

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
        user_id: currentUserId
    })
};


// ------------ CONTROLLLER FUNCTION TO SHOW A SINGLE POST DETAIL ------------
exports.showSinglePost = async (req, res) => {
    try {
        // Get the selected post data
        const postId = req.params.id;
        const currentPost = await Post.findSinglePost(postId).populate('authorId').populate('communityId');
        const comments = await Comment.findCommentsByPost(postId).populate('authorId');

        // get the community name
        const community = currentPost.communityId.name || null;

        // get user authentication status
        const currentUserId = req.session.user?.user_id || null;

        res.render('show', {
            currentPost,
            community,
            currentComments: comments,
            user_id: currentUserId,
            isAuthenticated: !!currentUserId
        });
    } catch (error) {
        res.status(500).send(`Error showing post: ${error.message}`);
    }
};
