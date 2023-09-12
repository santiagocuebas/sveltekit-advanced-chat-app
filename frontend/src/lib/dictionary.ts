import type { IKeys } from "./types/global";

export const selectJoin: IKeys<string> = {
	Group: 'joinGroupRoom',
	User: 'joinUserRoom'
};

export const selectCreate: IKeys<string> = {
	User: 'joinUser',
	Group: 'joinGroup'
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
