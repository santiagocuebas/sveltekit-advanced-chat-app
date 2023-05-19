export type Check = (value: string, custom?: string, pass?: string) => string | undefined;

export interface IKeys<Type> {
	[index: string]: Type;
}

export interface IMessage {
	_id: string;
	from: string;
	body: string;
	createdAt: Date;
}

export interface IUser {
	_id: string;
	email: string;
	password: string;
	username: string;
	avatar: string;
	description: string;
	contacts: string[];
	createdAt: Date;
}

export interface ResponseData {
	[index: string]: DataItem | string | boolean;
}

export interface DataItem {
	[index: string]: string | boolean | number;
}
