import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import { processFoundryActor } from './foundry-parser';
import { ItemModel } from './models/item';
import { UserModel } from './models/user';

(async () => {
  // Setup
  dotenv.config();

  // Connect to mongodb with mongoose
  const databaseUrl = process.env.DB_URI;
  if (!databaseUrl) throw new Error('Missing DB_URI environment variable');

  mongoose.set('strictQuery', false);
  await mongoose.connect(databaseUrl);
  console.log('Connected to MongoDB');
  console.log(` ${await UserModel.countDocuments()} users`);
  console.log(` ${await ItemModel.countDocuments()} items`);

  // If there are no users, add the GM user.
  if ((await UserModel.countDocuments()) === 0) {
    await UserModel.create({
      name: 'Ale',
      isGM: true
    });
  }

  // Start server
  const app = express();
  app.use(express.json({ limit: '50mb' }));

  app.use(
    cors({
      origin: [
        'https://localhost:5173',
        'http://localhost:5173',
        'https://olinkirk.land',
        'http://olinkirk.land'
      ],
      credentials: true
    })
  );

  app.get('/', (req, res) => res.send('Hello World!'));

  /**
   * Users
   */

  app.get('/users', async (req, res) => {
    const users = await UserModel.find();
    res.json(users);
  });

  app.post('/users', async (req, res) => {
    const user = await UserModel.create(req.body);
    res.json(user);
  });

  app.delete('/users/:id', async (req, res) => {
    const user = await UserModel.findByIdAndDelete(req.params.id);
    res.json(user);
  });

  /**
   * Items
   */

  app.get('/items', async (req, res) => {
    res.json(await ItemModel.find());
  });

  app.put('/items/:id/owner', async (req, res) => {
    await ItemModel.updateOne({ id: req.params.id }, { owner: req.body.owner });
    const item = await ItemModel.findOne({ id: req.params.id });
    res.json(item);
  });

  /**
   * Import a JSON file that was created in Foundry VTT
   */

  app.post('/upload', async (req, res) => {
    console.log('Received Foundry file');
    const foundryFile = req.body;
    const errors = await processFoundryActor(foundryFile);
    console.log('-> ' + (await UserModel.countDocuments()) + ' users');
    console.log('-> ' + (await ItemModel.countDocuments()) + ' items');
    if (errors.length == 0) res.status(200).send();
    else {
      console.log(
        'Errors processing the file: ' + errors.map((e) => e.message).join(', ')
      );
      res.status(500).send(errors);
    }
  });

  /**
   * Erase the data
   */

  app.delete('/erase', async (req, res) => {
    console.log('Erasing data');
    await ItemModel.deleteMany({});
    await UserModel.deleteMany({ isGM: false });
    console.log('-> ' + (await UserModel.countDocuments()) + ' users');
    console.log('-> ' + (await ItemModel.countDocuments()) + ' items');

    res.status(200).send();
  });

  /**
   * Updates
   */

  app.listen(process.env.PORT || 3005, () => {
    console.log(`Server started on port ${process.env.PORT || 3005}`);

    // TODO: Start the websocket server
  });
})();
