import { Router } from 'express';
import { getUser } from '../libs/index.js';
import { isLoggedIn } from '../middlewares/logged.js';
import { Group, User } from '../models/index.js';
import { StateOption, TypeContact } from '../types/enums.js';

const router = Router();

router.get(
	'/',
	isLoggedIn,
	async (req, res) => {
		const user = getUser(req.user);

		return res.json({ user });
	}
);

router.get(
	'/search/:param',
	isLoggedIn,
	async (req, res) => {
		const { param } = req.params;
		const { id, users, groupRooms } = req.user;

		const userIDs = users.map(users => users.userID);

		const contacts = await User
			.find({
				$or: [
					{ username: { $regex: '.*' + param + '.*' } },
					{ email: { $regex: '.*' + param + '.*' } }
				]
			})
			.lean({ virtuals: true })
			.select('id username avatar description users logged blacklist');
			
		const groups = await Group
			.find({ name: { $regex: '.*' + param + '.*' } })
			.lean({ virtuals: true })
			.select('id name avatar description blacklist');

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
	}
);

export default router;
