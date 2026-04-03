# Wadsup - Setup and Run Guide

Wadsup is a community forum web application where users can create posts, join communities, comment, vote, and save bookmarks.

We have hosted the web app online @ https://wad-assignment1.vercel.app/

This README provides the required step-by-step instructions for:

- a. Setting up the application from the submitted folder
- b. Running the application

## a. Setup the Application

1. Extract/open the submitted folder.
   The project root should contain files such as `server.js`, `package.json`, `routes/`, `controllers/`, and `views/`.

2. Open a terminal in the project root directory.

3. Install dependencies:
   ```bash
   npm install
   ```

## b. Run the Application

1. Start the server (development mode):
   ```bash
   npm run nodemon
   ```

   Or run without nodemon:
   ```bash
   npm start
   ```

2. Open your browser and go to:
   ```text
   http://localhost:8000
   ```

## Notes

- Default server URL: `http://localhost:8000`
- If startup fails, check:
  - `config.env` exists and has valid `DB` and `SECRET`
  - MongoDB is reachable
  - dependencies were installed successfully

## AI Usage Declaration

AI tools were used to:

- generate code for CSS styling
- generate boilerplate code structures
- explain code errors and provide debugging hints

All AI-generated output was reviewed, adapted, and tested by the project team before submission.

AI was NOT used for higher order thinking tasks
