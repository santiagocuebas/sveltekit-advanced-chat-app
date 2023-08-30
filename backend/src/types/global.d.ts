/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-interface */
import type { TypeContact } from './enums.js';

declare global {
	namespace Express {
		interface Request {
			user: IUser;
		}
	}
}

declare module 'http' {
	interface IncomingMessage {
		cookies: any;
	}
}

declare module 'socket.io' {
	interface Socket {
		user: IUser;
	}
}

export type Users = { userID: string, roomID: string };

export type Blacklist = { id: string, name: string, type: TypeContact };

export type Members = { id: string, name: string };

export type BlacklistGroup = { id: string, name: string };

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
	tempId?: string;
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
	blacklist: Blacklist[];
	createdAt: Date;
}

export type IPartialUser = Pick<IUser, 'id' | 'username' | 'avatar' | 'description' | 'blacklist'>;

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
	blacklist: BlacklistGroup[];
	blockedIDs: string[];
	createdAt: Date;
}
