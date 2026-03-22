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
    const vote_data = req.body;
    console.log('vote_data: ', vote_data);

    // Read the vote data
    console.log('here');
}

