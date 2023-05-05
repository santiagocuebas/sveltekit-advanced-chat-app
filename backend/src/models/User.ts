import { Schema, model } from 'mongoose';
import { IUser } from '../global.js';

const userSchema = new Schema<IUser>({
	username: { type: String, allowNull: false, unique: true },
	password: String
}, {
	timestamps: true
});

export const User = model<IUser>('User', userSchema);
