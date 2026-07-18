const mongoose = require('mongoose');

async function connectDB() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mydocumentvault';

  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(mongoUri);
    console.log(`MongoDB connected at ${mongoose.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    console.log('Please make sure MongoDB is running or update MONGODB_URI in your .env file.');
  }
}

module.exports = connectDB;
