import { CustomValidator } from 'express-validator';
import { User } from '../models/User.js';
import { matchPassword } from '../libs/bcrypt.js';

export const isValidPassword: CustomValidator = async (value, { req }) => {
	const user = await User.findOne({ username: req.body.username });

	if (user !== null) {
		const match = await matchPassword(value, user.password);
		
		if (!match) throw new Error('Incorrect password');
	}

	return true;
};
