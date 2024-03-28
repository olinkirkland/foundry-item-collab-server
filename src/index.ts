import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { UserModel } from './models/user';

(async () => {
  // Setup
  dotenv.config();

  // Connect to mongodb with mongoose
  const databaseUrl = process.env.DB_URI;
  if (!databaseUrl) throw new Error('Missing DB_URI environment variable');

  console.log('Connecting to MongoDB ...');
  await mongoose.connect(databaseUrl);

  console.log('✅', 'Connected to MongoDB');
  console.log(` ${await UserModel.countDocuments()} users`);
})();
