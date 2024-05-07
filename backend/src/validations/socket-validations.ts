import type { IUser, Member } from '../types/global.js';
import type { GroupInit, IContact, IKeys } from '../types/types.js';
import {
	isArray,
	isLength,
	isMember,
	isString,
	isValidKey,
	isValidUsers,
	isValidUser,
	checkVariablesAndFindGroup
} from './socket-custom.js';
import { ErrorMessage } from '../dictionary.js';
import { Chat, Group, User } from '../models/index.js';
import { StateOption, TypeContact } from '../types/enums.js';

const validStates: string[] = Object.values(StateOption);
const typeContacts: string[] = Object.values(TypeContact);

export const joinUserRoom = (
	[contactID, roomID]: [string, string],
	{ id, userIDs, userRooms }: IUser
) => {
	return (
		isString(contactID) &&
		isString(roomID) &&
		userIDs.includes(contactID) &&
		userRooms.includes(roomID) &&
		(contactID + id === roomID || id + contactID === roomID)
	) ? true : ErrorMessage.connectRoom;
};

export const joinGroupRoom = ([contactID]: [string], { groupRooms }: IUser) => {
	return isString(contactID) && groupRooms.includes(contactID)
		? true
		: ErrorMessage.connectRoom;
};

export const createChat = async ([chat, tempID]: [string, string]) => {
	return isString(chat) && isString(tempID) && isLength(chat, 0, 420)
		? true
		: ErrorMessage.createChat;
};

export const existChat = async ([id]: [string]) => {
	if (isString(id)) {
		const chat = await Chat.findOne({ _id: id });

		if (chat !== null) return true;
	}

	return ErrorMessage.existChat;
};

export const blockGroup = ([name]: [string]) => {
	return (isString(name) && isLength(name, 3, 40)) ? true : ErrorMessage.blockGroup;
};

export const addMembers = async (
	[members, groupID]: [Member[], string],
	{ id, groupRooms }: IUser
) => {
	const group = await checkVariablesAndFindGroup(groupID, groupRooms, members);

	if (group === null) return ErrorMessage.connectRoom;

	for (const member of members) {
		if (
			!isMember(member) ||
			group.allIDs.includes(member.id) ||
			!group.validIDs.includes(id) ||
			await isValidUser(groupID, member)
		) return ErrorMessage.addMembers;
	}

	return true;
};

export const banMembers = async (
	[userIDs, groupID]: [string[], string],
	{ id, groupRooms }: IUser
) => {
	const group = await checkVariablesAndFindGroup(groupID, groupRooms, userIDs);

	if (group === null) return ErrorMessage.connectRoom;

	for (const userID of userIDs) {
		if (
			!isString(userID) ||
			!group.memberIDs.includes(userID) ||
			!group.validIDs.includes(id) ||
			group.blockedIDs.includes(userID)
		) return ErrorMessage.banMembers;
	}

	return true;
};

export const blockMembers = async (
	[members, groupID]: [Member[], string],
	{ id, groupRooms }: IUser
) => {
	const group = await checkVariablesAndFindGroup(groupID, groupRooms, members);

	if (group === null) return ErrorMessage.connectRoom;

	for (const member of members) {
		if (
			!isMember(member) ||
			!group.memberIDs.includes(member.id) ||
			!group.validIDs.includes(id) ||
			group.blockedIDs.includes(member.id)
		) return ErrorMessage.blockMembers;
	}

	return true;
};

export const unblockMembers = async (
	[userIDs, groupID]: [string[], string],
	{ id, groupRooms }: IUser
) => {
	const group = await checkVariablesAndFindGroup(groupID, groupRooms, userIDs);

	if (group === null) return ErrorMessage.connectRoom;

	for (const userID of userIDs) {
		if (
			!isString(userID) ||
			!group.validIDs.includes(id) ||
			!group.blockedIDs.includes(userID)
		) return ErrorMessage.unblockMembers;
	}

	return true;
};

export const addMods = async (
	[members, groupID]: [Member[], string],
	{ id, groupRooms }: IUser
) => {
	const group = await checkVariablesAndFindGroup(groupID, groupRooms, members);

	if (group === null) return ErrorMessage.connectRoom;

	for (const member of members) {
		if (
			!isMember(member) ||
			id !== group.adminID ||
			!group.memberIDs.includes(member.id)
		) return ErrorMessage.addMods;
	}

	return true;
};

export const removeMods = async (
	[members, groupID]: [Member[], string],
	{ id, groupRooms }: IUser
) => {
	const group = await checkVariablesAndFindGroup(groupID, groupRooms, members);

	if (group === null) return ErrorMessage.connectRoom;

	for (const member of members) {
		if (
			!isMember(member) ||
			id !== group.adminID ||
			!group.modIDs.includes(member.id)
		) return ErrorMessage.removeMods;
	}

	return true;
};

export const avatar = async ([avatar]: [string]) => {
	if (isString(avatar)) {
		const group = await Group.findOne({ avatar });
		
		if (group !== null) return true;
	}

	return ErrorMessage.avatar;
};

export const description = ([description]: [string]) => {
	return (isString(description), isLength(description, 0, 420))
		? true
		: ErrorMessage.description;
};

export const state = ([state]: [string]) => {
	return (validStates.includes(state)) ? true : ErrorMessage.state;
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

	return ErrorMessage.unblock;
};

export const joinRoom = async (
	[{ contactID, roomID, type }]: [IContact],
	{ id, userIDs, userRooms, groupRooms }: IUser
) => {
	if (
		isString(contactID) &&
		isString(roomID) &&
		((type === TypeContact.GROUP && !groupRooms.includes(roomID)) ||
			(type === TypeContact.USER && !userIDs.includes(contactID) && !userRooms.includes(roomID)))
	) {
		const match = type === TypeContact.USER
			? await User.findOne({
				_id: id,
				users: { $elemMatch: { userID: contactID, roomID } } })
			: await Group.findOne({
				$or: [
					{ _id: roomID, members: { $elemMatch: { id } } },
					{ _id: roomID, mods: { $elemMatch: { id } } }
				] });

		if (match !== null) return true;
	}

	return ErrorMessage.connectRoom;
};

export const removeRoom = async (
	[id, type]: [string, TypeContact],
	{ userRooms, groupRooms }: IUser
) => {
	return (
		isString(id) &&
		(userRooms.includes(id) || groupRooms.includes(id)) &&
		typeContacts.includes(type)
	) ? true : ErrorMessage.removeRoom;
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

	return ErrorMessage.connectRoom;
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

	return ErrorMessage.connectRoom;
};

export const groupInit = async ([group]: [GroupInit], { userIDs }: IUser) => {
	return (
		typeof group === 'object' &&
		isValidKey(Object.keys(group)) &&
		isString(group.name) &&
		validStates.includes(group.state) &&
		isArray(group.members) &&
		isArray(group.mods) &&
		await isValidUsers([...group.members, ...group.mods], userIDs)
	) ? true : ErrorMessage.groupInit;
};
