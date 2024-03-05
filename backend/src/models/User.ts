/* eslint-disable quotes */
import type { IUser } from '../types/global.js';
import { Schema, model } from 'mongoose';
import MLV from 'mongoose-lean-virtuals';
import { TypeUser } from '../types/enums.js';

const userSchema = new Schema<IUser>({
	username: { type: String },
	email: { type: String, unique: true },
	githubId: { type: Number, unique: true },
	password: { type: String },
	type: { type: String, default: TypeUser.EMAIL },
	logged: { type: Boolean, default: false },
	tempId: { type: String },
	avatar: { type: String, default: 'https://res.cloudinary.com/dnu1qjhqz/image/upload/v1707468289/advanced/avatar/avatar.png' },
	description: { type: String, default: "It's just another description of a user" },
	users: [Object],
	groupRooms: [String],
	blockedUsers: [Object],
	blockedGroups: [Object]
}, {
	timestamps: {
		createdAt: true,
		updatedAt: false
	},
	toJSON: { virtuals: true },
	virtuals: true
});

userSchema
	.virtual('name')
	.get(function(this): string {
		return this.username;
	});

userSchema
	.virtual('userIDs')
	.get(function(this): string[] {
		return this.users?.map(users => users.userID);
	});

userSchema
	.virtual('userRooms')
	.get(function(this): string[] {
		return this.users?.map(users => users.roomID);
	});

userSchema
	.virtual('blockedUsersIDs')
	.get(function(this): string[] {
		return this.blockedUsers?.map(users => users.id);
	});

userSchema
	.virtual('blockedGroupsIDs')
	.get(function(this): string[] {
		return this.blockedGroups?.map(groups => groups.id);
	});

userSchema.plugin(MLV);

export const User = model<IUser>('User', userSchema);
