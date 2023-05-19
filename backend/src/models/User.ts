/* eslint-disable quotes */
import { Schema, model } from 'mongoose';
import { IUser } from '../global.js';

const userSchema = new Schema<IUser>({
	email: { type: String, allowNull: false, unique: true },
	password: String,
	username: String,
	avatar: { type: String, default: 'avatar.png' },
	description: { type: String, default: `It's just another description of a user` },
	contacts: [String]
}, {
	timestamps: {
		createdAt: true,
		updatedAt: false
	}
});

export const User = model<IUser>('User', userSchema);
