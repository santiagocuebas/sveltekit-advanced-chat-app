import { CustomValidator } from 'express-validator';
import { matchPassword } from '../libs/index.js';
import { User } from '../models/index.js';
import {
	ImageFormats,
	AudioFormats,
	VideoFormats,
	TypeUser,
	QueryType,
	TypeContact
} from '../types/enums.js';

const validImageFormat: string[] = Object.values(ImageFormats);
const validAudioFormat: string[] = Object.values(AudioFormats);
const validVideoFormat: string[] = Object.values(VideoFormats);

export const isValidPassword: CustomValidator = async (value, { req }) => {
	const user = await User
		.findOne({ email: req.body.email, type: TypeUser.EMAIL })
		.catch(() => {
			throw new Error('An error has occurred with the database');
		});

	if (user === null) return true;

	const match = await matchPassword(value, user.password)
		.catch(() => false);
		
	if (!match) throw new Error('Incorrect password');
	
	return match;
};

export const isValidFormat: CustomValidator = (_value, { req }) => {
	return validImageFormat.includes(req.file?.mimetype ?? '');
};

export const isCorrectPassword: CustomValidator = async (value, { req }) => {
	const match = await matchPassword(value, req.user.password)
		.catch(() => false);

	if (!match) throw new Error('Incorrect password');

	return true;
};

export const existsUsers: CustomValidator = (value, { req }) => {
	for (const id of value) {
		if (typeof value === 'string' && !req.user?.blockedUsersIDs.includes(id)) {
			return false;
		}
	}

	return true;
};

export const existsGroups: CustomValidator = (value, { req }) => {
	for (const id of value) {
		if (typeof value === 'string' && !req.user?.blockedGroupsIDs.includes(id)) {
			return false;
		}
	}

	return true;
};

export const isUndefinedImages: CustomValidator = (_value, { req }) => {
	for (const file of req.files) {
		if (typeof file !== 'object' || file === null) return false;
	}

	return true;
};

export const isValidReceiver: CustomValidator = (value, { req }) => {
	return (
		(req.query?.type === TypeContact.GROUP && req.user.groupRooms.includes(value) &&
			value === req.query.roomID) ||
		(req.query?.type === TypeContact.USER && req.user.userIDs.includes(value) &&
		req.user.userRooms.includes(req.query.roomID) && req.query.roomID.includes(value)));
};

export const isValidSizesAndFormat: CustomValidator = (_value, { req }) => {
	for (const file of req.files) {
		if (
			!(file.size < 2e7 && validImageFormat.includes(file.mimetype)) &&
			!(
				req.files.length === 1 &&
				file.size < 2.5e7 &&
				(validAudioFormat.includes(file.mimetype) ||
					validVideoFormat.includes(file.mimetype)))
		) return false;
	}

	return true;
};

export const isValidContact: CustomValidator = (value, { req }) => {
	return (
		(req.query?.type === QueryType.USERS && req.user.userIDs.includes(value)) ||
		(req.query?.type === QueryType.GROUPS && req.user.groupRooms.includes(value)));
};
