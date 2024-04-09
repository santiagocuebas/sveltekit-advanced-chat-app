import type { IGroup, Member } from '../types/global.js';
import fs from 'fs/promises';
import { resolve } from 'path';
import { User } from '../models/index.js';

export const isString = (value: unknown): boolean => typeof value === 'string';

export const isObject = (value: unknown): boolean => typeof value === 'object';

export const isArray = (value: unknown): boolean => value instanceof Array;

export const isLength = (value: string | string[] | Member[], min: number, max: number): boolean => {
	return value.length > min && value.length <= max;
};

export const existsImage = async (values: string[]): Promise<boolean> => {
	for (const value of values) {
		if (!isString(value)) return false;

		const path = resolve(value);

		const stringBuffer = await fs
			.readFile(path)
			.catch(err => {
				console.error(err);
				return null;
			});

		if (!stringBuffer) return false;
	}

	return true;
};

export const isValidUser = async (
	groupID: string,
	{ id, name }: Member
): Promise<boolean> => {
	const user = await User
		.findOne({ _id: id, username: name })
		.select('blockedGroups')
		.lean({ virtuals: true });

	return !(user !== null && !user.blockedGroupsIDs.includes(groupID));
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

	for (const key of values) {
		if (typeof key !== 'string' || !arrayValues.includes(key)) return false;
	}

	return true;
};

export const isValidUsers = async (members: Member[], userIDs: string[]) => {
	for (const member of members) {
		if (
			!isObject(member) ||
			!isString(member.id) ||
			!isString(member.name) ||
			!userIDs.includes(member.id) ||
			!(await User.findOne({ _id: member.id, username: member.name }))
		) return false;
	}

	return true;
};
