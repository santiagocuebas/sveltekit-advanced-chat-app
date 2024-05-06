import type { Member } from '../types/global.js';
import { Group, User } from '../models/index.js';

export const isString = (value: unknown) => typeof value === 'string';

export const isArray = (value: unknown) => value instanceof Array;

export const isMember = (value: Member) => {
	return typeof value === 'object' && isString(value.id) && isString(value.name);
};

export const isLength = (
	value: string | string[] | Member[],
	min: number,
	max: number
) => value.length > min && value.length <= max;

export const isValidUser = async (groupID: string, { id, name }: Member) => {
	const user = await User
		.findOne({ _id: id, username: name })
		.select('blockedGroups')
		.lean({ virtuals: true });

	return user === null || user.blockedGroupsIDs.includes(groupID);
};

export const isValidKey = (values: string[]) => {
	const arrayValues = ['name', 'mods', 'members', 'state'];

	for (const key of values) {
		if (typeof key !== 'string' || !arrayValues.includes(key)) return false;
	}

	return true;
};

export const isValidUsers = async (members: Member[], userIDs: string[]) => {
	for (const member of members) {
		if (
			!isMember(member) ||
			!userIDs.includes(member.id) ||
			!(await User.findOne({ _id: member.id, username: member.name }))
		) return false;
	}

	return true;
};

export const checkVariablesAndFindGroup = async (
	id: string,
	rooms: string[],
	memberIDs: string[] | Member[]
) => {
	if (
		isString(id) &&
		rooms.includes(id) &&
		isArray(memberIDs) &&
		isLength(memberIDs, 0, 2^10)
	) {
		const group = await Group.findOne({ _id: id });

		if (group === null) return group;

		return {
			adminID: group.admin,
			memberIDs: group.memberIDs,
			modIDs: group.modIDs,
			blockedIDs: group.blockedIDs,
			validIDs: [group.admin, ...group.modIDs],
			allIDs: [group.admin, ...group.modIDs, ...group.memberIDs, ...group.blockedIDs]
		};
	}

	return null;
};
