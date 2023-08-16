import { User } from '../models/index.js';
import { IGroup, Members } from '../types/global.js';

export const isString = (value: unknown): boolean => typeof value === 'string';

export const isObject = (value: unknown): boolean => typeof value === 'object';

export const isLength = (value: string, min: number, max: number): boolean => {
	return value.length > min && value.length <= max;
};

export const groupList = (group: IGroup) => {
	const adminID = group.admin;
	const memberIDs = group.members.map(member => member.id);
	const modIDs = group.mods.map(member => member.id);
	const blockedIDs = group.blacklist.map(member => member.id);

	return {
		adminID,
		memberIDs,
		modIDs,
		blockedIDs,
		validIDs: [adminID, ...modIDs],
		allIDs: [adminID, ...modIDs, ...memberIDs, ...blockedIDs]
	};
};

export const isValidKey = (values: string[]) => {
	const arrayValues = ['name', 'mods', 'members', 'state'];
	let match = true;

	for (const key of values) {
		if (typeof key !== 'string' || !arrayValues.includes(key)) {
			match = false;
			break;
		}
	}

	return match;
};

export const isValidUsers = async (members: Members[], userIDs: string[]) => {
	let match = true;

	for (const member of members) {
		if (
			!isObject(member) ||
			!isString(member.id) ||
			!isString(member.name) ||
			!userIDs.includes(member.id) ||
			!(await User.findOne({ _id: member.id, username: member.name }))
		) {
			match = false;
			break;
		}
	}

	return match;
};
