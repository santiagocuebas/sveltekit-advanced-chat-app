import { CustomValidator } from 'express-validator';
import { extname } from 'path';
import { matchPassword } from '../libs/index.js';
import { User } from '../models/index.js';
import { Ext, TypeUser } from '../types/enums.js';

export const existsUser: CustomValidator = async username => {
	const user = await User.findOne({ username });

	if (user !== null) throw new Error('The username is register');

	return true;
};

export const isValidPassword: CustomValidator = async (value, { req }) => {
	const user = await User.findOne({ email: req.body.email, type: TypeUser.EMAIL });

	if (user === null) return true;

	const match = await matchPassword(value, user.password)
		.catch(err => {
			console.error(err?.message);
			return false;
		});
		
	if (!match) throw new Error('Incorrect password');
	
	return match;
};

export const isUndefinedImage: CustomValidator = (_value, { req }) => {
	return req.file !== undefined;
};

export const isValidExtension: CustomValidator = (_value, { req }) => {
	console.log(req.file);
	const ext: string = extname(req.file.originalname).toLowerCase();
	const values: string[] = Object.values(Ext);

	return values.includes(ext);
};

export const isValidSize: CustomValidator = (_value, { req }) => {
	return req.file.size < 1e6;
};

export const isCorrectPassword: CustomValidator = async (value, { req }): Promise<boolean> => {
	const match = await matchPassword(value, req.user.password)
		.catch(err => {
			console.error(err?.message);
			return false;
		});

	if (!match) throw new Error('Incorrect password');

	return true;
};

export const existsUsers: CustomValidator = (value, { req }): boolean => {
	const parchedValue = value instanceof Array ? value : [value];

	for (const id of parchedValue) {
		if (typeof value === 'string' && !req.user?.blockedUsersIDs.includes(id)) {
			throw new Error('An error has occurred');
		}
	}

	return true;
};

export const existsGroups: CustomValidator = (value, { req }): boolean => {
	const parchedValue = value instanceof Array ? value : [value];

	for (const id of parchedValue) {
		if (typeof value === 'string' && !req.user?.blockedUsersIDs.includes(id)) {
			throw new Error('An error has occurred');
		}
	}

	return true;
};

export const isArrayImages: CustomValidator = (_value, { req }) => {
	return req.files instanceof Array;
};

export const isValidLengthImages: CustomValidator = (_value, { req }) => {
	return req.files.length <= 4;
};

export const isUndefinedImages: CustomValidator = (_value, { req }) => {
	for (const file of req.files) {
		if (typeof file !== 'object' || file === null) return false;
	}

	return true;
};

export const isValidSizesAndFormat: CustomValidator = (_value, { req }) => {
	const values: string[] = Object.values(Ext);

	for (const file of req.files) {
		const ext: string = extname(file.originalname).toLowerCase();

		if (file.size > 2e7 || !values.includes(ext)) return false;
	}

	return true;
};
