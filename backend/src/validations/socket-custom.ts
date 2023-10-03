import type { IGroup, Member } from '../types/global.js';
import fs from 'fs-extra';
import { resolve } from 'path';
import { User } from '../models/index.js';

export const isString = (value: unknown): boolean => typeof value === 'string';

export const isObject = (value: unknown): boolean => typeof value === 'object';

export const isArray = (value: unknown): boolean => value instanceof Array;

export const isLength = (value: string | string[] | Member[], min: number, max: number): boolean => {
	return value.length > min && value.length <= max;
};

export const existsImage = async (values: string[]): Promise<boolean> => {
	let match = true;

	for (const value of values) {
		if (!isString(value)) {
			match = false;
			break;
		}

		const data = await fs
			.readFile(resolve(`uploads/${value}`))
			.catch(err => err);

		if (!(data instanceof Buffer)) {
			match = false;
			break;
		}
	}

	return match;
};

export const isValidUser = async (
	groupID: string,
	{ id, name }: Member
): Promise<boolean> => {
	const user = await User
		.findOne({ _id: id, username: name })
		.select('blockedGroups')
		.lean({ virtuals: true });

	if (user !== null) {
		if (user.blockedGroupsIDs.includes(groupID)) return true;

		return false;
	}

	return true;
};

export const groupList = ({ admin, memberIDs, modIDs, blockedIDs }: IGroup) => {
	return {
		adminID: admin,
		memberIDs,
		modIDs,
		blockedIDs,
		validIDs: [admin, ...modIDs],
		allIDs: [admin, ...modIDs, ...memberIDs, ...blockedIDs]
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

export const isValidUsers = async (members: Member[], userIDs: string[]) => {
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
