import { body, query, type ValidationChain } from 'express-validator';
import {
	isValidPassword,
	isValidFormat,
	isCorrectPassword,
	existsUsers,
	existsGroups,
	isUndefinedImages,
	isValidSizesAndFormat,
	isValidContact,
	isValidReceiver,
	patchSkip
} from './customs-validators.js';
import { QueryType, TypeContact } from '../types/enums.js';

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
	query('type', 'Invalid type')
		.isString().bail()
		.custom(value => value === TypeContact.USER || value === TypeContact.GROUP),
	query('roomID', 'Invalid room')
		.isString().bail()
		.custom((value, { req }) => req.user.userRooms.includes(value) ||
			req.user.groupsRooms.includes(value)),
	query('id', 'Invalid id')
		.isString().bail()
		.custom(isValidReceiver),
	body('audiovisual', 'Enter a valid image archive')
		.custom((_value, { req }) => req.files instanceof Array).bail()
		.custom((_value, { req }) =>req.files.length <= 4).bail()
		.custom(isUndefinedImages).bail()
		.custom(isValidSizesAndFormat)
];

export const arrayAvatar: ValidationChain[] = [
	body('avatar', 'Enter a valid image archive')
		.custom((_value, { req }) => req.file !== undefined).bail()
		.custom(isValidFormat).bail()
		.custom((_value, { req }) => req.file.size < 1e6)
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
	body('unblockUsers', 'An error occurred while trying to unblock the user')
		.customSanitizer(value => value instanceof Array ? value : [value])
		.custom(existsUsers),
	body('unblockGroups', 'An error occurred while trying to unblock the group')
		.customSanitizer(value => value instanceof Array ? value : [value])
		.custom(existsGroups)
];

export const arrayChats: ValidationChain[] = [
	query('skip')
		.customSanitizer(patchSkip),
	query('type', 'Invalid type')
		.custom(value => value === QueryType.USERS || value === QueryType.GROUPS),
	query('id', 'Invalid id')
		.isString().bail()
		.custom(isValidContact)
];
