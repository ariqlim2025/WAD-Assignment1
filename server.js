// -------------------- IMPORTS --------------------
// 1. packages & modules
const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs = require('fs');

// 2. root routes
const post = require('./routes/post-routes');
const vote = require('./routes/vote-routes');


// --------------- DEFINE SERVER  -----------------
// 1. start express application server
const server = express();

// 2. allow handling of for POST request
server.use(express.urlencoded({ extended: true }));

// 3. express.json() as a middleware
server.use(express.json());

// 4. set EJS as view engine
server.set("view engine", "ejs");

// 5. serve static files (CSS, images, favicon, etc.)
server.use(express.static('public'));

// 6. use established root routes
server.use('/', post);
server.use('/', vote);


// specify the path to the environment variable file 'config.env'
dotenv.config({ path: './config.env' });

// async function to connect to DB
async function connectDB() {
  try {
    // connecting to Database with our config.env file and DB is constant in config.env
    await mongoose.connect(process.env.DB);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

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
// connectDB().then(startServer);
connectDB().then(startServer);
