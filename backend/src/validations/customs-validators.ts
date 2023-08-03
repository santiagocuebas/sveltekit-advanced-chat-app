import { CustomValidator } from 'express-validator';
import { matchPassword } from '../libs/index.js';
import { User } from '../models/index.js';
import { Ext } from '../types/enums.js';
import { extname } from 'path';

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
	const file = req.file;
	const ext: string = extname(file.originalname).toLowerCase();
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
