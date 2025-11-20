const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  try {
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Found' : 'Not found');
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: true,
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
      retryWrites: true,
      w: 'majority'
    });
    
    isConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    isConnected = false;
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

const isDBConnected = () => isConnected;

module.exports = { connectDB, isDBConnected };