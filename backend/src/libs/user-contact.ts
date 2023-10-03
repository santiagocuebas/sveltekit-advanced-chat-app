import type { IUser } from '../types/global.js';
import type { IContact, IKeys } from '../types/types.js';
import { User, Chat, Group } from '../models/index.js';
import { TypeContact } from '../types/enums.js';
import { getContact } from './get-data.js';

export const getContacts = async (
	id: string,
	{ users, groupRooms }: IUser
): Promise<IKeys<IContact[]>> => {
	const contacts: IKeys<IContact[]> = { users: [], groups: [] };

	for (const { userID, roomID } of users) {
		const contact = await User
			.findOne({ _id: userID })
			.select('username avatar users blockedGroups logged')
			.lean({ virtuals: true });

		if (contact !== null) {
			const chat = await Chat
				.findOne({ from: userID, to: id })
				.sort({ createdAt: -1 });

			const data = getContact(userID, roomID, contact, TypeContact.USER, chat);

			contacts.users.push(data);
		}
	}

	for (const key of groupRooms) {
		const contact = await Group
			.findOneAndUpdate({ _id: key }, { $addToSet: { connectedUsers: id } })
			.lean({ virtuals: true });

		if (contact !== null) {
			const chat = await Chat
				.findOne({ to: key })
				.sort({ createdAt: -1 });

			const data = getContact(key, key, contact, TypeContact.GROUP, chat);

			contacts.groups.push(data);
		}
	}

	return contacts;
};
