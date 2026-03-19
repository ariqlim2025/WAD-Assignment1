// -------------------- IMPORTS --------------------
// 1. packages & modules
const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs = require('fs');

// 2. root routes
const displayPosts = require('./routes/displayposts-routes');


// --------------- DEFINE SERVER  -----------------
// 1. start express application server
const server = express();

// 2. allow handling of for POST request
server.use(express.urlencoded({ extended: true }));

// 3. express.json() as a middleware
server.use(express.json());

// 4. set EJS as view engine
server.set("view engine", "ejs");

// 5. use established root routes
server.use('/', displayPosts);



// specify the path to the environment variable file 'config.env'
dotenv.config({ path: './config.env' });

// async function to connect to DB


// function to start server
function startServer() {
  const hostname = "localhost"; // Define server hostname
  const port = 8000;// Define port number
 
  // Start the server and listen on the specified hostname and port
  server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
  });
}

// call connectDB first and when connection is ready we start the web server
startServer();