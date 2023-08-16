import type { Direction, IKeys } from '../types/types.js';
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

	const users = await User
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

	const contacts: IKeys<string>[] = [];

	for (const user of users) {
		const isBlockedUsers = user.blacklist
			.filter(({ type }) => type === TypeContact.USER)
			.map(({ id }) => id)
			.includes(id);

		const isBlockedGroups = user.blacklist
			.filter(({ type }) => type === TypeContact.GROUP)
			.map(({ id }) => id)
			.includes(id);
		
		if (
			user.id !== id &&
			!userIDs.includes(user.id) &&
			!isBlockedUsers &&
			!isBlockedGroups
		) {
			contacts.push({
				id: user.id,
				name: user.name,
				avatar: user.avatar,
				description: user.description,
				type: TypeContact.USER
			});
		}
	}

	for (const group of groups) {
		let match = false;

		if (group.state === StateOption.PROTECTED) {
			for (const id of [group.admin, ...group.modIDs, ...group.memberIDs]) {
				if (userIDs.includes(id)) {
					match = true;
					break;
				}
			}
		}

		const isBlockedUsers = group.blacklist
			.map(({ id }) => id)
			.includes(id);

		if (
			!groupRooms.includes(group.id) &&
			!isBlockedUsers &&
			(group.state === StateOption.PUBLIC || match)
		) {
			contacts.push({
				id: group.id,
				name: group.name,
				avatar: group.avatar,
				description: group.description,
				type: TypeContact.GROUP
			});
		}
	}

	return res.json(contacts);
};

export const postPassword: Direction = async (req, res) => {
	const { password } = req.body;
	let match = false;

	if (typeof password === 'string') {
		match = await matchPassword(password, req.user.password);
	}

	return res.json({ match });
};
