import type { Request, Response, NextFunction } from 'express';
import type { IUser, IGroup, Member, Users } from './global.js';
import type { StateOption, TypeContact } from './enums.js';

export type Direction = (
	req: Request,
	res: Response,
	next: NextFunction
) => void;

export type ActUser = (
	contactID: string,
	roomID: string,
	user: IUser,
	name?: string
) => IUser;

export type Contact = (
	roomID: string,
	contact: IUser | IGroup,
	type: TypeContact,
	id?: string
) => Promise<IContact>;

export interface GroupInit {
	name: string;
	mods: Member[];
	members: Member[];
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
	members?: Member[];
	mods?: Member[];
	blacklist?: Member[];
	blockedIDs?: string[];
	state?: string;
	content?: string | string[];
	createdAt?: Date;
}

export interface IOption {
	users: Users[];
	blacklist?: Member[];
}

export interface IKeys<T> {
	[index: string]: T;
}
