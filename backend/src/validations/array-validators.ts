import { body, type ValidationChain } from 'express-validator';
import {
	isValidPassword,
	isValidEmail,
	existsUser
} from './customs-validators.js';

export const arraySignin: ValidationChain[] = [
	body('email', 'Enter a valid email')
		.exists({ values: 'falsy' }).bail()
		.isEmail().bail()
		.isLength({ max: 60 }).withMessage('The email must not have more than 60 characters').bail()
		.custom(isValidEmail),
	body('password', 'Invalid password')
		.exists({ values: 'falsy' }).bail()
		.isString().bail()
		.isStrongPassword().withMessage('The password must contains at least a lowercase, a uppercase, a number and a special character').bail()
		.isLength({ max: 40 }).withMessage('The password must not have more than 40 characters').bail()
		.custom(isValidPassword)
];

export const arrayRegister: ValidationChain[] = [
	body('username', 'Invalid username')
		.exists({ values: 'falsy' }).bail()
		.isString().bail()
		.isLength({ min: 3, max: 40 }),
	body('email', 'Enter a valid email')
		.exists({ values: 'falsy' }).bail()
		.isEmail().bail()
		.isLength({ max: 60 }).withMessage('The email must not have more than 60 characters').bail()
		.custom(existsUser),
	body('password', 'Invalid password')
		.exists({ values: 'falsy' }).bail()
		.isString().bail()
		.isStrongPassword().withMessage('The password must contains at least a lowercase, a uppercase, a number and a special character').bail()
		.isLength({ max: 40 }).withMessage('The password must not have more than 40 characters'),
	body('confirmPassword', 'Password not match')
		.custom((value, { req }) => value === req.body.password)
];
