import type { TypeContact } from "./enums";

export type Contacts = [IContact[], IContact[]];

export type Members = { id: string, name: string };

export type Blacklist = { id: string, name: string, type: TypeContact };

export type Check = (value: string, custom?: string, pass?: string) => string | undefined;

export interface IKeys<Type> {
	[index: string]: Type;
}

export interface IUser {
	id: string;
	username: string;
	avatar: string;
	description: string;
	blacklist: Blacklist[];
}

export interface IContact {
	contactID: string;
	roomID: string;
	name: string;
	avatar: string;
	logged: boolean | number;
	type: TypeContact;
	admin?: string;
	mods?: Members[];
	members?: Members[];
	blacklist?: Members[];
	content?: string;
	createdAt?: Date;
}

export interface IList {
	id: string;
	name: string;
	avatar: string;
	description: string;
	logged?: boolean;
}


export interface IChat {
	_id: string;
	from: string;
	to: string;
	username?: string;
	content: string;
	createdAt: Date;
}

export interface ResponseData {
	[index: string]: DataItem | string | boolean;
}

export interface DataItem {
	[index: string]: string | boolean | number;
}

export interface ILoaded {
	image: string;
	enabled: boolean;
}

export interface IError {
	message: string;
	error: boolean;
}
