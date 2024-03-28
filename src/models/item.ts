import mongoose, { Schema } from 'mongoose';

export type Item = {
  id: string;
  owner: string;
  name: string;
  type: string;
  level: number;
  description: string;
  price: number;
  quantity: number;
  bulk: number;
};

export type ItemDocument = Item & mongoose.Document;

const ItemSchema = new Schema<ItemDocument>({
  id: String,
  owner: String,
  name: String,
  type: String,
  level: Number,
  description: String,
  price: Number,
  quantity: Number,
  bulk: Number
});

export const ItemModel = mongoose.model<ItemDocument>('Item', ItemSchema);
