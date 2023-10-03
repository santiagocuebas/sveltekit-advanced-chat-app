import type { IGroup, IUser, Member } from '../types/global.js';
import type { GroupInit, IContact, IKeys } from '../types/types.js';
import {
	existsImage,
	groupList,
	isArray,
	isLength,
	isObject,
	isString,
	isValidKey,
	isValidUsers,
	isValidUser
} from './socket-custom.js';
import { Chat, Group, User } from '../models/index.js';
import { StateOption, TypeContact } from '../types/enums.js';

export const joinUserRoom = (
	[contactID, roomID]: [string, string],
	{ id, userIDs, userRooms }: IUser
) => {
	if (
		isString(contactID) &&
		isString(roomID) &&
		userIDs.includes(contactID) &&
		userRooms.includes(roomID) &&
		(contactID + id === roomID || id + contactID === roomID)
	) return true;

	return {
		error: 'Join Error',
		message: 'An error occurred while trying to join'
	};
};

export const joinGroupRoom = ([contactID]: [string], { groupRooms }: IUser) => {
	if (isString(contactID) && groupRooms.includes(contactID)) return true;

	return {
		error: 'Join Error',
		message: 'An error occurred while trying to join'
	};
};

export const createChat = async ([chat, tempID]: [string & string[], string]) => {
	if (isString(tempID)) {
		if (isString(chat) && isLength(chat, 0, 420)) return true;
		if (isArray(chat) && isLength(chat, 0, 3) && await existsImage(chat)) return true;
	}

	return {
		error: 'Chat Error',
		message: 'The chat content is invalid'
	};
};

export const deleteChat = async ([id]: [string]) => {
	if (isString(id)) {
		const chat = await Chat.findOne({ _id: id });

		if (chat !== null) return true;
	}

	return {
		error: 'Chat Error',
		message: 'The id is invalid'
	};
};

export const blockGroup = ([name]: [string]) => {
	if (isString(name) && isLength(name, 3, 40)) return true;

	return {
		error: 'Group Error',
		message: 'The id or name is invalid'
	};
};

export const addMembers = async (
	[members, groupID]: [Member[], string],
	{ id, groupRooms }: IUser
) => {
	if (
		isString(groupID) &&
		groupRooms.includes(groupID) &&
		isArray(members) &&
		isLength(members, 0, 2^10)
	) {
		const group = await Group.findOne({ _id: groupID });

		if (group !== null) {
			const { allIDs, validIDs } = groupList(group);
			let match: boolean | IKeys<string> = true;

			for (const member of members) {
				if (
					!isObject(member) ||
					!isString(member.id) ||
					!isString(member.name) ||
					allIDs.includes(member.id) ||
					!validIDs.includes(id) ||
					await isValidUser(groupID, member)
				) {
					match = {
						error: 'Group Error',
						message: 'An error occurred while trying to join the user'
					};

					break;
				}
			}

			return match;
		}
	}

	return {
		error: 'Join Error',
		message: 'An error occurred while trying to join'
	};
};

export const banMembers = async (
	[userIDs, groupID]: [string[], string],
	{ id, groupRooms }: IUser
) => {
	if (
		isString(groupID) &&
		groupRooms.includes(groupID) &&
		isArray(userIDs) &&
		isLength(userIDs, 0, 2^10)
	) {
		const group = await Group.findOne({ _id: groupID });

		if (group !== null) {
			const { memberIDs, blockedIDs, validIDs } = groupList(group);
			let match: boolean | IKeys<string> = true;

			for (const userID of userIDs) {
				if (
					!isString(userID) ||
					!memberIDs.includes(userID) ||
					!validIDs.includes(id) ||
					blockedIDs.includes(userID)
				) {
					match = {
						error: 'Group Error',
						message: 'An error occurred while trying ban the user'
					};

					break;
				}
			}

			return match;
		}
	}

	return {
		error: 'Join Error',
		message: 'An error occurred while trying to join'
	};
};

export const blockMembers = async (
	[members, groupID]: [Member[], string],
	{ id, groupRooms }: IUser
) => {
	if (
		isString(groupID) &&
		groupRooms.includes(groupID) &&
		isArray(members) &&
		isLength(members, 0, 2^10)
	) {
		const group = await Group.findOne({ _id: groupID });

		if (group !== null) {
			const { memberIDs, blockedIDs, validIDs } = groupList(group);
			let match: boolean | IKeys<string> = true;

			for (const member of members) {
				if (
					!isObject(member) ||
					!isString(member.id) ||
					!isString(member.name) ||
					!memberIDs.includes(member.id) ||
					!validIDs.includes(id) ||
					blockedIDs.includes(member.id)
				) {
					match = {
						error: 'Group Error',
						message: 'An error occurred while trying block the user'
					};

					break;
				}
			}

			return match;
		}
	}

	return {
		error: 'Join Error',
		message: 'An error occurred while trying to join'
	};
};

export const unblockMembers = async (
	[userIDs, groupID]: [string[], string],
	{ id, groupRooms }: IUser
) => {
	if (
		isString(groupID) &&
		groupRooms.includes(groupID) &&
		isArray(userIDs) &&
		isLength(userIDs, 0, 2^10)
	) {
		const group = await Group.findOne({ _id: groupID });

		if (group !== null) {
			const { blockedIDs, validIDs } = groupList(group);
			let match: boolean | IKeys<string> = true;

			for (const userID of userIDs) {
				if (
					!isString(userID) ||
					!validIDs.includes(id) ||
					!blockedIDs.includes(userID)
				) {
					match = {
						error: 'Group Error',
						message: 'An error occurred while trying unblocking the user'
					};

					break;
				}
			}

			return match;
		}
	}

	return {
		error: 'Join Error',
		message: 'An error occurred while trying to join'
	};
};

export const addMods = async (
	[members, groupID]: [Member[], string],
	{ id, groupRooms }: IUser
) => {
	if (
		isString(groupID) &&
		groupRooms.includes(groupID) &&
		isArray(members) &&
		isLength(members, 0, 2^10)
	) {
		const group = await Group.findOne({ _id: groupID });

		if (group !== null) {
			const { memberIDs, adminID } = groupList(group);
			let match: boolean | IKeys<string> = true;

			for (const member of members) {
				if (
					!isObject(member) || 
					!isString(member.id) ||
					!isString(member.name) ||
					id !== adminID ||
					!memberIDs.includes(member.id)
				) {
					match = {
						error: 'Group Error',
						message: 'An error occurred while trying add the mod'
					};

					break;
				}
			}

			return match;
		}
	}

	return {
		error: 'Join Error',
		message: 'An error occurred while trying to join'
	};
};

export const removeMods = async (
	[members, groupID]: [Member[], string],
	{ id, groupRooms }: IUser
) => {
	if (
		isString(groupID) &&
		groupRooms.includes(groupID) &&
		isArray(members) &&
		isLength(members, 0, 2^10)
	) {
		const group = await Group.findOne({ _id: groupID });

		if (group !== null) {
			const { modIDs, adminID } = groupList(group);
			let match: boolean | IKeys<string> = true;

			for (const member of members) {
				if (
					!isObject(member) ||
					!isString(member.id) ||
					!isString(member.name) ||
					id !== adminID ||
					!modIDs.includes(member.id)
				) {
					match = {
						error: 'Group Error',
						message: 'An error occurred while trying remove the mod'
					};

					break;
				}
			}

			return match;
		}
	}

	return {
		error: 'Join Error',
		message: 'An error occurred while trying to join'
	};
};

export const avatar = async ([avatar]: [string]) => {
	if (isString(avatar)) {
		const group = await Group.findOne({ avatar });
		
		if (group !== null) return true;
	}

	return {
		error: 'Avatar Error',
		message: 'The avatar is invalid'
	};
};

export const description = ([description]: [string]) => {
	if (isString(description), isLength(description, 0, 420)) return true;

	return {
		error: 'Description Error',
		message: 'The description is invalid'
	};
};

export const state = ([state]: [string]) => {
	const validStates: string[] = Object.values(StateOption);
	if (validStates.includes(state)) return true;

	return {
		error: 'State Error',
		message: 'The state is invalid'
	};
};

export const unblock = (
	[{ users, groups }]: [IKeys<string[]>],
	{ blockedUsers, blockedGroups }: IUser
) => {
	if (isArray(users), isArray(groups)) {
		const listUsers = blockedUsers.filter(({ id }) => users.includes(id));
		const listGroups = blockedGroups.filter(({ id }) => groups.includes(id));

		if (listUsers.length === users.length && listGroups.length === groups.length) {
			return true;
		}
	}

	return {
		error: 'Unblock Error',
		message: 'Please reload the page'
	};
};

export const joinRoom = async (
	[{ contactID, roomID, type }]: [IContact],
	{ id, userIDs, userRooms, groupRooms }: IUser
) => {
	if (
		isString(contactID) &&
		isString(roomID) &&
		(
			(type === TypeContact.USER && !userIDs.includes(contactID) && !userRooms.includes(roomID)) ||
			(type === TypeContact.GROUP && !groupRooms.includes(roomID))
		)
	) {
		let match: IUser | IGroup | null = null;

		if (type === TypeContact.USER) {
			match = await User.findOne(
				{ _id: id, users: { $elemMatch: { userID: contactID, roomID } } }
			);
		} else {
			match = await Group.findOne(
				{ _id: roomID, members: { $elemMatch: { id } } }
			);
		}

		if (match !== null) return true;
	}

	return {
		error: 'Join Error',
		message: 'An error occurred while trying to join'
	};
};

export const removeRoom = async (
	[id, type]: [string, TypeContact],
	{ userRooms, groupRooms }: IUser
) => {
	const typeContacts = Object.values(TypeContact);

	if (
		isString(id) &&
		(userRooms.includes(id) || groupRooms.includes(id)) &&
		typeContacts.includes(type)
	) return true;

	return {
		error: 'Join Error',
		message: 'An error occurred while trying delete to room'
	};
};

export const joinUser = async (
	[userID]: [string],
	{ id, userIDs, blockedUsersIDs }: IUser
) => {
	if (
		isString(userID) &&
		!userIDs.includes(userID) &&
		!blockedUsersIDs.includes(userID)
	) {
		const user = await User
			.findOne({ _id: userID })
			.lean({ virtuals: true });
		
		if (user && !user.blockedUsersIDs.includes(id)) return true;
	}

	return {
		error: 'Join Error',
		message: 'An error occurred while trying to join'
	};
};

export const joinGroup = async (
	[groupID]: [string],
	{ id, groupRooms, blockedGroupsIDs }: IUser
) => {
	if (
		isString(groupID) &&
		!groupRooms.includes(groupID) &&
		!blockedGroupsIDs.includes(groupID)
	) {
		const group = await Group
			.findOne({ _id: groupID })
			.lean({ virtuals: true });
		
		if (group && !group.blockedIDs.includes(id)) return true;
	}

	return {
		error: 'Join Error',
		message: 'An error occurred while trying to join'
	};
};

export const groupInit = async ([group]: [GroupInit], { userIDs }: IUser) => {
	const validStates: string[] = Object.values(StateOption);

	if (
		isObject(group) &&
		isValidKey(Object.keys(group)) &&
		isString(group.name) &&
		validStates.includes(group.state) &&
		group.members instanceof Array &&
		group.mods instanceof Array &&
		await isValidUsers([...group.members, ...group.mods], userIDs)
	) return true;

	return {
		error: 'Group Error',
		message: 'An error occurred while trying to create the group'
	};
};
