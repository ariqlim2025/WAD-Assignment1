# Wadsup - Setup and Run Guide

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

4. Create a `config.env` file in the project root (same level as `server.js`) with:
   ```env
   DB=<your_mongodb_connection_string>
   SECRET=<your_session_secret>
   ```
   Example:
   ```env
   DB=mongodb://127.0.0.1:27017/wadsup
   SECRET=replace_with_a_long_random_secret
   ```

5. Make sure your MongoDB database is available (local MongoDB or MongoDB Atlas).

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
