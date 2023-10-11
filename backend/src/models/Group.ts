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
	description: { type: String, default: "It's just another description of a group" },
	avatar: { type: String, default: 'avatar.jpeg' },
	loggedUsers: [String],
	state: { type: String, default: StateOption.PUBLIC },
	blacklist: [Object]
}, {
	timestamps: {
		createdAt: true,
		updatedAt: false
	},
	toJSON: { virtuals: true }
});

groupSchema
	.virtual('modIDs')
	.get(function(this): string[] {
		return this.mods?.map(mod => mod.id);
	});

groupSchema
	.virtual('memberIDs')
	.get(function(this): string[] {
		return this.members?.map(member => member.id);
	});

groupSchema
	.virtual('blockedIDs')
	.get(function(this): string[] {
		return this.blacklist?.map(user => user.id);
	});

groupSchema
	.virtual('logged')
	.get(function(this): number {
		return this.loggedUsers?.length;
	});

groupSchema.plugin(MLV);

export const Group = model<IGroup>('Group', groupSchema);
