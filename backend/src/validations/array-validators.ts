import { body, ValidationChain } from 'express-validator';
import { isValidPassword } from './customs-validators.js';

export const arrayRegister: ValidationChain[] = [
	body('email', 'Invalid email')
		.exists({ checkFalsy: true }).bail()
		.isEmail().bail()
		.isLength({ max: 100 }).withMessage('The email is too long'),
	body('password')
		.exists({ checkFalsy: true })
		.isString().bail()
		.isLength({ min: 5, max: 60 }).withMessage('The password is too short or too long').bail()
		.matches(/[0-9]/).withMessage('Password must constain a number').bail()
		.custom(isValidPassword)
];
