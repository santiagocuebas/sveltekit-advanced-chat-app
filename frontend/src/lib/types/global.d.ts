export type Contact = IForeign & IGroup;

export type Contacts = [IForeign[], IGroup[]];

export type Members = { id: string, name: string };

export type Check = (
	value: string,
	custom?: string,
	pass?: string
) => string | undefined;

export type GroupProps = { id: string, name: string, type: TypeContact };

export type ChoiceSocket = (contact: Contact) => IKeys<(value: any) => any>;

export interface IKeys<Type> {
	[index: string]: Type;
}

export interface RawUser {
	id: string;
	username: string;
	avatar: string;
	description: string;
	blockedUsers: Members[];
	blockedGroups: Members[];
}

export interface IUser {
	[index: string]: string | IKeys<Members[]>;
	id: string;
	username: string;
	avatar: string;
	description: string;
	blocked: IKeys<Members[]>;
}

interface IContact {
	contactID: string;
	roomID: string;
	name: string;
	avatar: string;
	logged: boolean | number;
	type: string;
	content?: string | string[];
	createdAt?: string;
}

export interface IForeign extends IContact {
	blockedIDs: string[];
}

export interface IGroup extends IContact {
	admin: string;
	mods: Members[];
	members: Members[];
	blacklist: Members[];
	description: string;
	state: string;
}

export interface IList {
	contactID: string;
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
	[index: string]: Members[] | string[] | string | ((key: string) => void) | undefined;
	add: Members[];
	ban: string[];
	block: Members[];
	unblock: string[];
	addMod: Members[];
	removeMod: Members[];
	description: string;
	state: string;
	destroy?;
}

export interface ISettingsProps {
	[index: string]: string | IKeys<boolean> | IKeys<string[]> | ((key: string) => void);
	avatar: string;
  username: string;
	description: string;
	password: IKeys<boolean>;
  unblock: IKeys<string[]>;
	resetProps: (key: string) => ISettingsProps;
}

export interface ResponseData {
	[index: string]: string | string[] | boolean | IKeys<string> | IList[] | IUser;
	user: RawUser;
	errors: IKeys<string>;
	filename: string;
	filenames: string[];
	contacts: IList[];
	logout: boolean;
	error: IKeys<string>;
}

export interface SettingsData {
	[index: string]: string | IKeys<string>;
	errors: string;
	success: string;
	filename: string;
	message: string | IKeys<string>;
	error: IKeys<string>;
}
