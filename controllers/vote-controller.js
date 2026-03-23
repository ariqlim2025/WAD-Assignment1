const Post      = require('../models/post');
const Community = require('../models/community');
const Comment   = require('../models/comment');
const Vote      = require('../models/vote');
const Bookmark  = require('../models/bookmark');

const fs = require('fs/promises');
const path = require('path');

const votes = path.join(__dirname, '../data/votes.json');

// Controller function to add a vote to a post
exports.addVote = async (req, res) => {

    // Get the user ID from the session
    const userId = "69bf916c4e7188eacfdc67a6"; // hardcoded, swap to req.session.user_id once auth finish

    // Read the vote data from the post that is being selected
    const vote_data = req.body;

    // console.log('vote_data: ', vote_data);
    const postId = vote_data.postId;                      // postID is equal to the post that the user voted on
    const selected_value = Number(vote_data.value);       // value > (-1 is downvote, 1 is upvote)

    // Validation - if user edits the HTML or sends via Postman
    if (selected_value !== 1 && selected_value !== -1) {
        return res.status(400).send('Invalid vote value');
    }

    try {
        // Check if the user has already voted on this post and what was his vote
        const existingVote = await Vote.findOne({ userId: userId, postId: postId });    
        // console.log(existingVote);
        if (existingVote) {
            // check if user upvoted or downvoted
            // console.log(existingVote);
            // {
            //     _id: new ObjectId('69bf916c4e7188eacfdc67ff'),
            //     userId: new ObjectId('69bf916c4e7188eacfdc67a6'),
            //     postId: new ObjectId('69bf916c4e7188eacfdc67ca'),
            //     value: 1,
            // }
            const current_vote = existingVote.value;

            // if he vote the different thing > update database > reload '/' page (vote will minus 2)
            if (current_vote !== selected_value) {
                // vote will minus 2
                await Vote.updateOne({ _id: existingVote._id }, { $set: { value: selected_value } });
            }
            else {
                await Vote.deleteOne({ _id: existingVote._id });
            }
        }
        else {
            await Vote.create({ userId, postId, value: selected_value });
        }
        res.redirect('/');
    } catch (error) {
        console.error('Error adding vote:', error);
        res.status(500).send('Internal Server Error');
    }
}

