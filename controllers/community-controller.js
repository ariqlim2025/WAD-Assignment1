const bcrypt = require('bcrypt');
const User   = require('../models/User');
const Post   = require('../models/Post');
const Comment = require('../models/Comment');
const Bookmark = require('../models/Bookmark');

const fs = require('fs/promises');
const path = require('path');

// // Controller function to add a vote to a post
// exports.addCommunity = (req, res) => {

//     // Read the vote data

//     console.log("hello community");
// }