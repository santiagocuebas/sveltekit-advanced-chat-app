import type { Document } from 'mongoose';
import type { IKeys } from './types.js';

declare module 'http' {
	interface IncomingMessage {
		cookies: IKeys<string>;
		user: IUser;
	}
}

declare module 'socket.io' {
	interface Socket {
		user: IUser;
	}
}

export type Users = { userID: string, roomID: string };

export type Member = { id: string, name: string };

export type DocumentChat = Document<unknown, object, IChat> & IChat;

export type Chats = (
	room: string,
	id?: string,
	skip?: number,
	limit?: number
) => Promise<DocumentsChat[]>

export interface IChat {
	_id: string;
	from: string;
	to: string;
	username?: string;
	type: string;
	content: string | string[];
	createdAt: Date;
}

export interface IUser {
	_id: string;
	id: string;
	tempId: string;
	socketIds: string[];
	githubId: number;
	email: string;
	username: string;
	password: string;
	name: string;
	logged: boolean;
	type: string;
	avatar: string;
	description: string;
	users: Users[];
	userIDs: string[];
	userRooms: string[];
	groupRooms: string[];
	blockedUsers: Member[];
	blockedUsersIDs: string[];
	blockedGroups: Member[];
	blockedGroupsIDs: string[];
	createdAt: Date;
}

export type IPartialUser = Pick<IUser, 'id' | 'username' | 'type' | 'avatar' | 'description' | 'blockedUsers' | 'blockedGroups'>;

export interface IGroup {
	_id: string;
	id: string;
	admin: string;
	mods: Member[];
	modIDs: string[];
	members: Member[];
	memberIDs: string[];
	allIDs: string[];
	name: string;
	state: string;
	description: string;
	avatar: string;
	loggedUsers: string[];
	logged: string[];
	blacklist: Member[];
	blockedIDs: string[];
	createdAt: Date;
}
