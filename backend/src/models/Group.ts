/* eslint-disable quotes */
import type { IGroup } from '../types/global.js';
import { Schema, model } from 'mongoose';
import MLV from 'mongoose-lean-virtuals';
import { StateOption } from '../types/enums.js';

const groupSchema = new Schema<IGroup>({
	admin: { type: String, required: true },
	mods: [Object],
	members: [Object],
	name: { type: String, allowNull: false, required: true },
	avatar: { type: String, default: 'uploads/group-avatar/avatar.jpeg' },
	description: { type: String, default: "It's just another description of a group" },
	loggedUsers: [String],
	state: { type: String, default: StateOption.PUBLIC },
	blacklist: [Object]
}, {
	timestamps: {
		createdAt: true,
		updatedAt: false
	},
	toJSON: { virtuals: true },
	virtuals: true
});

groupSchema
	.virtual('modIDs')
	.get(function(this): string[] {
		return this.mods?.map(mod => mod.id) ?? [];
	});

groupSchema
	.virtual('memberIDs')
	.get(function(this): string[] {
		return this.members?.map(member => member.id) ?? [];
	});

groupSchema
	.virtual('allIDs')
	.get(function(this): string[] {
		const members = this.members?.map(member => member.id) ?? [];
		const mods = this.mods?.map(mod => mod.id) ?? [];
		return [this.admin, ...mods, ...members];
	});

groupSchema
	.virtual('blockedIDs')
	.get(function(this): string[] {
		return this.blacklist?.map(user => user.id);
	});

groupSchema
	.virtual('logged')
	.get(function(this): string[] {
		return this.loggedUsers;
	});

groupSchema.plugin(MLV);

export const Group = model<IGroup>('Group', groupSchema);
