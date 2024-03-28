import mongoose, { Schema } from 'mongoose';

export type User = {
  name: string;
  isGM: boolean; // Whether the user is a GM or not
};

export type UserDocument = User & mongoose.Document;

const UserSchema = new Schema<UserDocument>({
  name: String,
  isGM: Boolean
});

export const UserModel = mongoose.model<UserDocument>('User', UserSchema);
