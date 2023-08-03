import type { Direction } from '../types/types.js';
import { getUser, matchPassword } from '../libs/index.js';
import { Group, User } from '../models/index.js';
import { StateOption, TypeContact } from '../types/enums.js';

export const getData: Direction = (req, res) => {
	const user = getUser(req.user);
		
	return res.json({ user });
};

export const getSearch: Direction = async (req, res) => {
	const { param } = req.params;
	const { id, userIDs, groupRooms } = req.user;

	const contacts = await User
		.find({
			$or: [
				{ username: { $regex: '.*' + param + '.*' } },
				{ email: param }
			]
		})
		.lean({ virtuals: true })
		.select('id username avatar description users logged blacklist');
		
	const groups = await Group
		.find({ name: { $regex: '.*' + param + '.*' } })
		.lean({ virtuals: true })
		.select('id name avatar description blacklist connectedUsers');

	const validUsers = contacts.filter(user => {
		const isBlockedUsers = user.blacklist
			.filter(({ type }) => type === TypeContact.USER)
			.map(({ id }) => id)
			.includes(id);

		const isBlockedGroups = user.blacklist
			.filter(({ type }) => type === TypeContact.GROUP)
			.map(({ id }) => id)
			.includes(id);
		
		return user.id !== id && !userIDs.includes(user.id) && !isBlockedUsers && !isBlockedGroups;
	});

	const validGroups = groups.filter(group => {
		const isBlockedUsers = group.blacklist
			.map(({ id }) => id)
			.includes(id);

		return !groupRooms.includes(group.id) && !isBlockedUsers && group.state !== StateOption.PRIVATE;
	});

	return res.json([...validUsers, ...validGroups]);
};

export const postPassword: Direction = async (req, res) => {
	const { password } = req.body;
	let match = false;

	if (typeof password === 'string') {
		match = await matchPassword(password, req.user.password);
	}

	return res.json({ match });
};
