export type Contact = IForeign & IGroup;

export type Member = { id: string, name: string };

export type Check = (value: string) => string | undefined;

export type GroupProps = { id: string, name: string, type: TypeContact };

export type ChoiceSocket = (contact: Contact) => IChoiseResult;

export type SetSettingsProps = (user: IUser) => ISettingsProps;

export type IsDisabledButton = (user: IUser) => IDisabledButton;

export interface IKeys<Type> {
	[index: string]: Type;
}

export interface IErrorsProps {
	success: boolean;
	message: string | IKeys<string>;
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
	type: string;
	avatar: string;
	description: string;
	blockedUsers: Member[];
	blockedGroups: Member[];
}

export interface IUser {
	[index: string]: string | IKeys<Member[]>;
	id: string;
	username: string;
	type: string;
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

export interface IContacts {
	users: IForeign[];
	groups: IGroup[];
	list: IList[];
}

export interface IChat {
	_id: string;
	from: string;
	to: string;
	username?: string;
	content: string | string[];
	createdAt: string;
}

export interface IChoiseResult {
	[index: string]: ((value?) => never[]) | ((value?) => string[]) | ((value: string) => string[]) | ((avatar: string) => Promise<string[]>) | ((members: Member[]) => [Member[], string]) | ((banIDs: string[]) => [string[], string]);
	leave: () => never[];
	blockGroup: () => string[];
	add: (members: any) => [Member[], string];
	ban: (banIDs: any) => [string[], string];
	block: (blockUsers: any) => [Member[], string];
	unblock: (unblockIDs: any) => [string[], string];
	addMod: (newMods: any) => [Member[], string];
	removeMod: (removeMod: any) => [Member[], string];
	avatar: (avatar: any) => Promise<string[]>;
	description: (description: any) => string[];
	state: (state: any) => string[];
	destroy: () => never[];
}

export interface IGroupProps {
	[index: string]: string | File | string[] | Member[] | undefined;
	add: Member[];
	ban: string[];
	block: Member[];
	unblock: string[];
	addMod: Member[];
	removeMod: Member[];
	avatar: string | File;
	description: string;
	state: string;
	destroy?;
}

export interface ISettingsProps {
	[index: string]: string | IKeys<boolean> | IKeys<string[]>;
	avatar: string;
  username: string;
	description: string;
	password: IKeys<boolean>,
  unblock: IKeys<string[]>;
}

export interface IDisabledButton {
	[index: string]: ((value: string) => boolean) | ((pass: IKeys<boolean>) => boolean) | ((list: IKeys<string[]>) => boolean);
	avatar: (value: any) => boolean;
  username: (value: any) => boolean;
	description: (value: any) => boolean;
	password: (pass: any) => boolean;
  unblock: (list: any) => boolean;
	delete: () => boolean;
}

export interface ResponseData {
	[index: string]: string | string[] | boolean | IKeys<string> | IList[] | RawUser;
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
	[index: string]: string | boolean | IKeys<string>;
	success: boolean;
	filename: string;
	message: string | IKeys<string>;
}
