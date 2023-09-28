import type { TypeContact } from './enums.js';
import type { IKeys } from './types.js';

declare global {
	namespace Express {
		interface Request {
			user: IUser;
		}
	}
}

declare module 'http' {
	interface IncomingMessage {
		cookies: IKeys<string>;
	}
}

declare module 'socket.io' {
	interface Socket {
		user: IUser;
	}
}

export type Users = { userID: string, roomID: string };

export type Members = { id: string, name: string };

export type PartialUser = (value: IUser) => IPartialUser;

export type Chats = (ids: string[], type?: TypeContact) => Promise<IChat[]>

export interface IChat {
	_id: string;
	from: string;
	to: string;
	username?: string;
	content: string | string[];
	createdAt: Date;
}

export interface IUser {
	_id: string;
	id: string;
	tempId: string;
	email: string;
	password: string;
	username: string;
	name: string;
	logged: boolean;
	avatar: string;
	description: string;
	users: Users[];
	userIDs: string[];
	userRooms: string[];
	groupRooms: string[];
	blockedUsers: Members[];
	blockedUsersIDs: string[];
	blockedGroups: Members[];
	blockedGroupsIDs: string[];
	createdAt: Date;
}

export type IPartialUser = Pick<IUser, 'id' | 'username' | 'avatar' | 'description' | 'blockedUsers' | 'blockedGroups'>;

export interface IGroup {
	_id: string;
	id: string;
	admin: string;
	mods: Members[];
	modIDs: string[];
	members: Members[];
	memberIDs: string[];
	name: string;
	state: string;
	description: string;
	avatar: string;
	connectedUsers: string[];
	logged: number;
	blacklist: Members[];
	blockedIDs: string[];
	createdAt: Date;
}
