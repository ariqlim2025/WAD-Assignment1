const fs = require('fs/promises');
const path = require('path');

// Controller function to list home page with all posts
exports.showPosts = async (req, res) => {
    // Load JSON data (To switch to MongoDB later, will remove this)
    const users = JSON.parse(await fs.readFile(path.join(__dirname, '../data/users.json')));
    const posts = JSON.parse(await fs.readFile(path.join(__dirname, '../data/posts.json')));
    const comments = JSON.parse(await fs.readFile(path.join(__dirname, '../data/comments.json')));

    // For each post, attach the author and count its comment
    for (let i = 0; i < posts.length; i++) {
        // Find the user whose _id matches the post's author ID
        for (let j = 0; j < users.length; j++) {
            if (users[j]._id === posts[i].author) {
                posts[i].author = users[j];
                break;
            }
        }
        // Count how many comments belong to this post
        let count = 0;
        for (let k = 0; k < comments.length; k++) {
            if (comments[k].post === posts[i]._id) {
                count++;
            }
        }
        posts[i].commentCount = count;
    }

    console.log(posts);
    console.log("here");
    
    res.render('home', {
        posts: posts,
        username: 'TheMonster112'
    })

    // posts = [
    //     {
    //         "_id": "p001",
    //         "title": "Just finished my WAD assignment!",
    //         "body": "Finally done with the Express + EJS project...",
    //         "author": {                          // was "u001", now the full user object
    //             "_id": "u001",
    //             "username": "TheMonster112",
    //             "email": "monster@mail.com",
    //             "password": "password123",
    //             "age": 21
    //         },
    //         "upvotedBy": ["u002", "u003"],
    //         "downvotedBy": [],
    //         "createdAt": "2026-03-18T10:30:00Z",
    //         "commentCount": 2                   // new field added by the loop
    //     },
}