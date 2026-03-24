// const bcrypt = require('bcrypt');
const User   = require('../models/user');
const Post   = require('../models/post');
const Comment = require('../models/comment');
const Bookmark = require('../models/bookmark');
const Vote = require('../models/vote');
const Community = require('../models/community');
const fs = require('fs/promises');
const path = require('path');

const communities = path.join(__dirname, '../data/communities.json');

// Controller function to add a community
exports.showCreateCommunityPage = async (req, res) => {
    res.render('createCommunity');
}

// Controller function to add a community
exports.addCommunity = (req, res) => {
    res.render('createCommunity', { 
        user_id: 'u001'
     });
}