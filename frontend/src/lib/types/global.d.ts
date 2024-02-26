export type Contact = IForeign & IGroup;

export type Member = { id: string, name: string };

export type Check = (value: string) => string | undefined;

export type GroupProps = { id: string, name: string, type: TypeContact };

export type ChoiceSocket = (contact: Contact) => IKeys<(value: any) => any>;

export interface IKeys<Type> {
	[index: string]: Type;
}

export interface RegisterInput {
	value: string;
	error: string | undefined;
	active: boolean;
	class: string;
	check: Check;
};

export interface RawUser {
	id: string;
	username: string;
	avatar: string;
	description: string;
	blockedUsers: Member[];
	blockedGroups: Member[];
}

export interface IUser {
	[index: string]: string | IKeys<Member[]>;
	id: string;
	username: string;
	avatar: string;
	description: string;
	blocked: IKeys<Member[]>;
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
	mods: Member[];
	members: Member[];
	blacklist: Member[];
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

export interface Contacts {
	[index: string]: IForeign[] | IGroup[];
	users: IForeign[];
	groups: IGroup[];
};

export interface IChat {
	_id: string;
	from: string;
	to: string;
	username?: string;
	content: string | string[];
	createdAt: string;
}

export interface IGroupProps {
	[index: string]: Member[] | string[] | string | ((key: string) => void) | undefined;
	add: Member[];
	ban: string[];
	block: Member[];
	unblock: string[];
	addMod: Member[];
	removeMod: Member[];
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
}

export interface ResponseData {
	[index: string]: string | string[] | boolean | IKeys<string> | IList[] | IUser;
	user: RawUser;
	token: string;
	errors: IKeys<string>;
	filename: string;
	filenames: string[];
	contacts: IList[];
	logout: boolean;
	error: IKeys<string>;
}

export interface SettingsData {
	[index: string]: string | IKeys<string>;
	errors: boolean;
	success: boolean;
	filename: string;
	message: string | IKeys<string>;
	error: IKeys<string>;
}
