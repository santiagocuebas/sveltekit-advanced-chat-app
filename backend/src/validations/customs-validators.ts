import { CustomValidator } from 'express-validator';
import { extname } from 'path';
import { matchPassword } from '../libs/index.js';
import { User } from '../models/index.js';
import { Ext } from '../types/enums.js';

export const existsUser: CustomValidator = async username => {
	const user = await User.findOne({ username });

	if (user !== null) throw new Error('The username is register');

	return true;
};

export const isValidPassword: CustomValidator = async (value, { req }) => {
	const user = await User.findOne({ email: req.body.email });

	if (user === null) return true;

	const match = await matchPassword(value, user.password);
		
	if (!match) throw new Error('Incorrect password');
	
	return match;
};

export const isUndefinedImage: CustomValidator = (_value, { req }) => {
	return req.file !== undefined;
};

export const isValidExtension: CustomValidator = (_value, { req }) => {
	const ext: string = extname(req.file.originalname).toLowerCase();
	const values: string[] = Object.values(Ext);

	return values.includes(ext);
};

export const isValidSize: CustomValidator = (_value, { req }) => {
	return req.file.size < 1e6;
};

export const isCorrectPassword: CustomValidator = async (value, { req }): Promise<boolean> => {
	const match: boolean = await matchPassword(value, req.user.password);

	if (!match) throw new Error('Incorrect password');

	return true;
};

export const existsUsers: CustomValidator = (value, { req }): boolean => {
	let match = true;

	if (typeof value === 'string') {
		if (!req.user?.blockedUsersIDs.includes(value)) match = false;
	} else if (value instanceof Array) {
		for (const id of value) {
			if (!req.user?.blockedUsersIDs.includes(id)) {
				match = false;
				break;
			}
		}
	}

	if (!match) throw new Error('An error has occurred');

	return match;
};

export const existsGroups: CustomValidator = (value, { req }): boolean => {
	let match = true;

	if (typeof value === 'string') {
		if (!req.user?.blockedGroupsIDs.includes(value)) match = false;
	} else if (value instanceof Array) {
		for (const id of value) {
			if (!req.user?.blockedGroupsIDs.includes(id)) {
				match = false;
				break;
			}
		}
	}

	if (!match) throw new Error('An error has occurred');

	return match;
};

export const isArrayImages: CustomValidator = (_value, { req }) => {
	return req.files instanceof Array;
};

export const isValidLengthImages: CustomValidator = (_value, { req }) => {
	return req.files.length < 4;
};

export const isUndefinedImages: CustomValidator = (_value, { req }) => {
	let match = true;

	for (const file of req.files) {
		if (typeof file !== 'object' || file === null) {
			match = false;
			break;
		}
	}

	return match;
};

export const isValidSizesAndFormat: CustomValidator = (_value, { req }) => {
	let match = true;

	for (const file of req.files) {
		const ext: string = extname(file.originalname).toLowerCase();
		const values: string[] = Object.values(Ext);

		if (file.size > 2e7 || !values.includes(ext)) {
			match = false;
			break;
		}
	}

	return match;
};
