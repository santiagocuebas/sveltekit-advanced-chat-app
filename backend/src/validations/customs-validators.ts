import { CustomValidator } from 'express-validator';
import { extname } from 'path';
import { matchPassword } from '../libs/index.js';
import { User } from '../models/index.js';
import { Ext } from '../types/enums.js';

export const isValidEmail: CustomValidator = async email => {
	const user = await User.findOne({ email });

	if (user === null) throw new Error('Incorret email');

	return true;
};

export const isValidPassword: CustomValidator = async (value, { req }) => {
	const user = await User.findOne({ email: req.body.email });

	if (user !== null) {
		const match = await matchPassword(value, user.password);
		
		if (!match) throw new Error('Incorrect password');
	}

	return true;
};

export const existsUser: CustomValidator = async email => {
	const user = await User.findOne({ email });

	if (user !== null) throw new Error('The email is register');

	return true;
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
	return req.file.size < 1048576;
};

export const isCorrectPassword: CustomValidator = async (value: string, { req }): Promise<boolean> => {
	const match: boolean = await matchPassword(value, req.user.password);

	if (!match) throw new Error('Incorrect password');

	return true;
};

export const isArrayString: CustomValidator = (value: string[]): boolean => {
	let match = true;

	for (const id of value) {
		if (typeof id !== 'string') {
			match = false;
			break;
		}
	}

	if (!match) throw new Error('An error has occurred');

	return true;
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

		if (file.size > 1e7 * 2 || !values.includes(ext)) {
			match = false;
			break;
		}
	}

	return match;
};
