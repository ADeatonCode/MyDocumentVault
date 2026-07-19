// This file connects the app to the database.
// If no real database is available, it can use a temporary one for testing.
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

async function connectDB() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mydocumentvault';

  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(mongoUri);
    console.log(`MongoDB connected at ${mongoose.connection.host}`);
  } catch (error) {
    if (process.env.USE_MEMORY_DB !== 'false' && process.env.NODE_ENV !== 'production') {
      try {
        mongoServer = await MongoMemoryServer.create();
        const memoryUri = mongoServer.getUri();
        await mongoose.connect(memoryUri);
        console.log(`MongoDB connected to in-memory server at ${memoryUri}`);
        return;
      } catch (memoryError) {
        console.error('In-memory MongoDB fallback failed:', memoryError.message);
      }
    }

    console.error('MongoDB connection failed:', error.message);
    console.log('Please make sure MongoDB is running or update MONGODB_URI in your .env file.');
  }
}

module.exports = connectDB;
