const Post      = require('../models/Post');
const Community = require('../models/Community');
const Comment   = require('../models/Comment');
const Vote      = require('../models/Vote');
const Bookmark  = require('../models/Bookmark');

const fs = require('fs/promises');
const path = require('path');

const votes = path.join(__dirname, '../data/votes.json');



