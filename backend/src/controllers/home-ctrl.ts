import type { Direction, IKeys } from '../types/types.js';
import { v2 as cloudinary } from 'cloudinary';
import {
	getId,
	matchId,
	matchPassword,
	dataUri
} from '../libs/index.js';
import { Group, User } from '../models/index.js';
import { StateOption, TypeContact } from '../types/enums.js';

export const getSearch: Direction = async (req, res) => {
	const { param } = req.params;
	const {
		id,
		userIDs,
		groupRooms,
		blockedUsersIDs,
		blockedGroupsIDs
	} = req.user;

	// Find contacts
	const users = await User
		.find({
			$or: [
				{ username: { $regex: '.*' + param + '.*' } },
				{ email: param }
			]
		})
		.lean({ virtuals: true })
		.select('id username avatar description users blockedUsers')
		.limit(150);
		
	const groups = await Group
		.find({ name: { $regex: '.*' + param + '.*' } })
		.lean({ virtuals: true })
		.limit(150);

	const contacts: IKeys<string>[] = [];

	for (const user of users) {
		if (
			user.id !== id &&
			!userIDs.includes(user.id) &&
			!blockedUsersIDs.includes(user.id) &&
			!user.blockedUsersIDs.includes(id)
		) {
			contacts.push({
				contactID: user.id,
				name: user.name,
				avatar: user.avatar,
				description: user.description,
				type: TypeContact.USER
			});
		}
	}

	for (const group of groups) {
		if (
			!groupRooms.includes(group.id) &&
			!blockedGroupsIDs.includes(group.id) &&
			!group.blockedIDs.includes(id) &&
			(group.state === StateOption.PUBLIC || matchId(group, userIDs))
		) {
			contacts.push({
				contactID: group.id,
				name: group.name,
				avatar: group.avatar,
				description: group.description,
				type: TypeContact.GROUP
			});
		}
	}

	return res.json({ contacts });
};

export const postPassword: Direction = async (req, res) => {
	const { password } = req.body;
	let match = false;

	if (typeof password === 'string') {
		// Check if is correct password
		match = await matchPassword(password, req.user.password);
	}

	return res.json({ match });
};

export const postImages: Direction = async (req, res) => {
	const files = req.files instanceof Array ? req.files : [];
	const filenames: string[] = [];

	for (const fileBuffer of files) {
		const file = dataUri(fileBuffer);

		if (file) {
			const data = await cloudinary.uploader
				.upload(file, { public_id: await getId(), folder: 'advanced/public/' })
				.catch(() => {
					console.log('An error occurred while trying to uploaded the image');
					return null;
				});

			if (data) filenames.push(data.secure_url);
		}
	}

	return res.json({ filenames });
};

export const postAvatar: Direction = async (req, res) => {
	const group = await Group.findOne({ _id: req.body.id, admin: req.user.id });
	
	if (group !== null && req.file) {
		const file = dataUri(req.file);

		if (file) {
			const data = await cloudinary.uploader
				.upload(file, {
					public_id: await getId(TypeContact.GROUP),
					folder: 'advanced/group-avatar/'
				})
				.catch(() => {
					console.log('An error occurred while trying to uploaded the image');
					return null;
				});

			if (data) {
				// Unlink old avatar
				if (!group.avatar.includes('avatar.jpeg')) {
					const [avatarFullFilename] = group.avatar.split('/').reverse();
					const [avatarFilename] = avatarFullFilename.split('.');
					
					await cloudinary.uploader
						.destroy('advanced/group-avatar/' + avatarFilename)
						.catch(() => {
							console.error('An error occurred while trying to delete the image');
						});
				}

				// Update database with the new avatar
				group.avatar = data.secure_url;
				await group.save();

				return res.json({ filename: data.secure_url });
			}
		}
	}

	return res.json(null);
};
