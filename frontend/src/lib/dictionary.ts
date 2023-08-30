import type { IKeys } from "./global";

export const selectJoin: IKeys<string> = {
	'Group': 'joinGroupRoom',
	'User': 'joinUserRoom'
};

export const OptionUser: IKeys<string> = {
	LEAVE: 'emitLeave',
	DESTROY: 'emitDestroy',
	BLOCK: 'emitBlock',
	BAD: 'emitBlockDestroy'
};

export const OptionMember: IKeys<string> = {
	LEAVE: 'emitLeaveGroup',
	BLOCKGROUP: 'emitBlockGroup'
};

export const OptionMod: IKeys<string> = {
	ADD: 'emitAddMember',
	BAN: 'emitBanMember',
	BLOCK: 'emitBlockMember',
	UNBLOCK: 'emitUnblockMember'
};

export const OptionAdmin: IKeys<string> = {
	ADDMOD: 'emitAddMod',
	REMOVEMOD: 'emitRemoveMod',
  AVATAR: 'emitChangeAvatar',
  DESCRIPTION: 'emitChangeDescription',
	STATE: 'emitChangeState',
	DESTROY: 'emitDestroyGroup'
};
