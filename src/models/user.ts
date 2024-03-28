import mongoose, { Schema } from 'mongoose';

export type User = {
  id: string;
  username: string;
  isGM: boolean; // Whether the user is a GM or not
};

export type UserDocument = User & mongoose.Document;

const UserSchema = new Schema<UserDocument>({
  id: String,
  username: String,
  isGM: Boolean
});

export const UserModel = mongoose.model<UserDocument>('User', UserSchema);
