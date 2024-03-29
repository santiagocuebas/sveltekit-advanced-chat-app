import { body, type ValidationChain } from 'express-validator';
import {
	isValidPassword,
	isUndefinedImage,
	isValidExtension,
	isValidSize,
	isCorrectPassword,
	existsUsers,
	existsGroups,
	isArrayImages,
	isUndefinedImages,
	isValidLengthImages,
	isValidSizesAndFormat
} from './customs-validators.js';

export const arrayRegister: ValidationChain[] = [
	body('email', 'Invalid email')
		.exists({ values: 'falsy' }).bail()
		.isEmail().bail()
		.isLength({ max: 60 }).withMessage('The email must not have more than 60 characters'),
	body('password', 'Invalid password')
		.exists({ values: 'falsy' }).bail()
		.isString().bail()
		.isStrongPassword().withMessage('The password must contains at least a lowercase, a uppercase, a number and a special character').bail()
		.isLength({ max: 40 }).withMessage('The password must not have more than 40 characters')
		.custom(isValidPassword)
];

export const arrayImages: ValidationChain[] = [
	body('images', 'Enter a valid image archive')
		.custom(isArrayImages).bail()
		.custom(isValidLengthImages).bail()
		.custom(isUndefinedImages).bail()
		.custom(isValidSizesAndFormat)
];

export const arrayAvatar: ValidationChain[] = [
	body('avatar', 'Enter a valid image archive')
		.custom(isUndefinedImage).bail()
		.custom(isValidExtension).bail()
		.custom(isValidSize)
];

export const arrayUsername: ValidationChain[] = [
	body('username', 'Invalid username')
		.exists({ values: 'falsy' }).bail()
		.isString().bail()
		.isLength({ min: 3, max: 40 }).withMessage('The username is too short or too long')
];

export const arrayDescription: ValidationChain[] = [
	body('description', 'An error has occurred')
		.isString().bail()
		.isLength({ max: 4000 }).withMessage('The description must not exceed 4000 characters')
];

export const arrayPassword: ValidationChain[] = [
	body('actPassword', 'Invalid password')
		.exists({ values: 'falsy' }).bail()
		.isString().bail()
		.custom(isCorrectPassword),
	body('newPassword', 'Invalid password')
		.exists({ values: 'falsy' }).bail()
		.isString().bail()
		.isStrongPassword().withMessage('The password must contains at least a lowercase, a uppercase, a number and a special character').bail()
		.isLength({ max: 40 }).withMessage('The password must not have more than 40 characters'),
	body('confirmPassword', 'Password not match')
		.custom((value, { req }) => value === req.body.newPassword)
];

export const arrayUnblock: ValidationChain[] = [
	body('unblockUsers', 'Unblock error')
		.custom(existsUsers),
	body('unblockGroups', 'Unblock error')
		.custom(existsGroups)
];
