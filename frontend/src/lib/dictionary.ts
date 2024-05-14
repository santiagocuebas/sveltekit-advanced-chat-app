import type { IKeys } from "./types/global";

export const selectJoin: IKeys<string> = {
	group: 'joinGroupRoom',
	groups: 'joinGroupRoom',
	user: 'joinUserRoom',
	users: 'joinUserRoom'
};

export const selectCreate: IKeys<string> = {
	user: 'joinUser',
	group: 'joinGroup'
};

export const listItems: IKeys<string>[] = [
	{ key: 'users', name: 'unblockUsers', text: 'user' },
	{ key: 'groups', name: 'unblockGroups', text: 'group' }
];

export const SettingsText: IKeys<string> = {
	avatar: 'Change avatar',
	username: 'Change username',
	description: 'Change description',
	password: 'Change password',
	unblock: 'Unblock contact',
	delete: 'Delete user'
};

export const UserText: IKeys<string> = {
	leave: 'Leave Room',
	block: 'Block User',
	destroy: 'Destroy Chat',
	bad: 'Destroy and Block'
};

export const GroupText: IKeys<string> = {
	leave: 'Leave Group',
	blockGroup: 'Block Group',
	add: 'Add Member',
	ban: 'Ban Member',
	block: 'Block Member',
	unblock: 'Unblock Member',
	addMod: 'Add Mod',
	removeMod: 'Remove Mod',
  avatar: 'Change Avatar',
  description: 'Change Description',
	state: 'Change State',
	destroy: 'Destroy Group'
};

export const Messages: IKeys<string> = {
	public: 'Everyone can join the group',
	protected: 'Only member contacts can join',
	private: 'Only members with authorization from the admin or moderators can join'
};

export const OptionUser: IKeys<string> = {
	leave: 'emitLeave',
	destroy: 'emitDestroy',
	block: 'emitBlock',
	bad: 'emitBlockDestroy'
};

export const OptionGroup: IKeys<string> = {
	leave: 'emitLeaveGroup',
	blockGroup: 'emitBlockGroup',
	add: 'emitAddMember',
	ban: 'emitBanMember',
	block: 'emitBlockMember',
	unblock: 'emitUnblockMember',
	addMod: 'emitAddMod',
	removeMod: 'emitRemoveMod',
  avatar: 'emitChangeAvatar',
  description: 'emitChangeDescription',
	state: 'emitChangeState',
	destroy: 'emitDestroyGroup'
};

export const ValidLeave: IKeys<string> = {
	leave: 'leave',
	blockGroup: 'blockGroup',
	destroy: 'destroy'
};
