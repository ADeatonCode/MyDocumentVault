# MyDocumentVault

A secure document vault starter built with HTML, CSS, JavaScript, Node.js, Express, and MongoDB.

## Features
- User registration and login with JWT authentication
- Secure password hashing with bcrypt
- File upload and listing for authenticated users
- MongoDB-backed document metadata storage
- Basic rate limiting and helmet security headers

## Setup
1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and update the values if needed.
3. Start MongoDB locally or update `MONGODB_URI`.
4. Run the app: `npm run dev`

## Notes
- The frontend is served from the Express app at `http://localhost:5000`.
- Uploaded files are stored in the `uploads` directory.
