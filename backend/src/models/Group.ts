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
	description: { type: String, default: 'It&#39;s just another description of a group' },
	avatar: { type: String, default: 'avatar.png' },
	connectedUsers: [String],
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
	.virtual('logged')
	.get(function(this): number {
		return this.connectedUsers.length;
	});

groupSchema.plugin(MLV);

export const Group = model<IGroup>('Group', groupSchema);
