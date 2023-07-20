import { Schema, model } from 'mongoose';
import MLV from 'mongoose-lean-virtuals';
import { IUser } from '../types/global.js';

const userSchema = new Schema<IUser>({
	email: { type: String, allowNull: false, unique: true, required: true },
	password: { type: String, required: true },
	username: { type: String, required: true },
	logged: { type: Boolean, default: false },
	tempId: { type: String },
	avatar: { type: String, default: 'avatar.png' },
	description: { type: String, default: 'It &#39; s just another description of a user' },
	users: [Object],
	groupRooms: [String],
	blacklist: [Object]
}, {
	timestamps: {
		createdAt: true,
		updatedAt: false
	},
	toJSON: { virtuals: true }
});

userSchema
	.virtual('name')
	.get(function(this): string {
		return this.username;
	});

userSchema
	.virtual('userRooms')
	.get(function(this): string[] {
		return this.users.map(users => users['roomID']);
	});

userSchema.plugin(MLV);

export const User = model<IUser>('User', userSchema);
