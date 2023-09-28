import type { Request, Response, NextFunction } from 'express';
import type {
	IUser,
	IGroup,
	IChat,
	Blacklist,
	Members,
	Users
} from './global.js';
import type { StateOption, TypeContact } from './enums.js';

export type Direction = (req: Request, res: Response, next: NextFunction) => void;

export type ActUser = (
	contactID: string,
	roomID: string,
	user: IUser,
	name?: string
) => IUser;

export type Contact = (
	contactID: string,
	roomID: string,
	contact: IUser | IGroup,
	type: TypeContact,
	chat?: IChat | null
) => IContact;

export interface GroupInit {
	name: string;
	mods: Members[];
	members: Members[];
	state: StateOption;
}

export interface IContact {
	contactID: string;
	roomID: string;
	name: string;
	avatar: string;
	description: string;
	logged: boolean | number;
	type: TypeContact;
	admin?: string;
	members?: Members[];
	mods?: Members[];
	blacklist?: Members[];
	blockedIDs?: string[];
	state?: string;
	content?: string | string[];
	createdAt?: Date;
}

export interface IOption {
	users: Users[];
	blacklist?: Blacklist[];
}

export interface IKeys<T> {
	[index: string]: T;
}
