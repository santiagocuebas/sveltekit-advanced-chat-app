export type Contacts = [IContact[], IContact[]];

export type Members = { id: string, name: string };

export type Blacklist = { id: string, name: string, type: TypeContact };

export type Check = (value: string, custom?: string, pass?: string) => string | undefined;

export type GroupProps = { id: string, name: string, type: TypeContact };

export type ChoiceSocket = (
	groups: IContact[],
	contact: IContact
) => IKeys<(value: any) => any>;

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
	description: string;
	logged: boolean | number;
	type: string;
	admin?: string;
	mods?: Members[];
	members?: Members[];
	blacklist?: Members[];
	state?: string;
	content?: string | string[];
	createdAt?: string;
}

export interface IList {
	id: string;
	name: string;
	avatar: string;
	description: string;
	type: string;
}

export interface IChat {
	_id: string;
	from: string;
	to: string;
	username?: string;
	content: string | string[];
	createdAt: string;
}

export interface IGroupProps {
	getProps: (contact: IContact) => IInitPropsExtended;
	resetProps: (contact: IInitPropsExtended) => IInitPropsExtended;
}

export interface IInitProps {
	[index: string]: Members[] | string[];
	ADD: Members[];
	BAN: string[];
	BLOCK: Members[];
	UNBLOCK: string[];
	ADDMOD: Members[];
	REMOVEMOD: Members[];
}

export interface IInitPropsExtended extends IInitProps {
	[index: string]: Members[] | string[] | string | undefined;
	DESCRIPTION: string;
	STATE: string;
	DESTROY?;
}

export interface ResponseData {
	[index: string]: IUser | IKeys<string>;
	user: IUser;
	errors: IKeys<string>;
	error: IKeys<string>;
}

export interface SettingsData {
	[index: string]: string | IKeys<string>;
	errors: string;
	success: string;
	filename: string;
	message: string | IKeys<string>;
}

export interface ILoaded {
	image: string;
	enabled: boolean;
}

export interface IError {
	message: string;
	error: boolean;
}
