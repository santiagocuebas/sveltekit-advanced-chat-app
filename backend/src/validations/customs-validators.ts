import { CustomValidator } from 'express-validator';
import { User } from '../models/User.js';
import { matchPassword } from '../libs/bcrypt.js';

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
