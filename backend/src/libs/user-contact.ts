import type { IUser, Users } from '../types/global.js';
import type { IContact, IKeys } from '../types/types.js';
import { User, Group } from '../models/index.js';
import { TypeContact } from '../types/enums.js';
import { getContact } from './get-data.js';

export const getContacts = async (
	id: string,
	{ users, userIDs, groupRooms }: IUser
): Promise<IKeys<IContact[]>> => {
	const contactList: IKeys<IContact[]> = { users: [], groups: [] };

	const contacts = await User
		.find({ _id: userIDs })
		.select('username avatar users blockedGroups logged')
		.lean({ virtuals: true });

	for (const contact of contacts) {
		const { roomID } = users.find(user => user.userID === contact.id) as Users;

		const data = await getContact(roomID, contact, TypeContact.USER, id);

		contactList.users.push(data);
	}

	const groups = await Group
		.find({ _id: groupRooms })
		.lean({ virtuals: true });

	for (const group of groups) {
		const data = await getContact(group.id, group, TypeContact.GROUP);

		contactList.groups.push(data);
	}

	return contactList;
};
