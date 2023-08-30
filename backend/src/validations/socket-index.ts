import type { IUser } from '../types/global.js';
import type { IKeys } from '../types/types.js';
import * as check from './socket-validations.js';

export const socketIndex: IKeys<(value: never, user: IUser) => true | IKeys<string> | Promise<true | IKeys<string>>> = {
	'joinUserRoom': check.joinUserRoom,
	'joinGroupRoom': check.joinGroupRoom,
	'emitChat': check.createChat,
	'emitDelete': check.deleteChat,
	'emitLeave': () => true,
	'emitBlock': () => true,
	'emitDestroy': () => true,
	'emitBlockDestroy': () => true,
	'emitLeaveGroup': () => true,
	'emitBlockGroup': check.blockGroup,
	'emitAddMember': check.addMembers,
	'emitBanMember': check.banMembers,
	'emitBlockMember': check.blockMembers,
	'emitUnblockMember': check.unblockMembers,
	'emitAddMod': check.addMods,
	'emitRemoveMod': check.removeMods,
	'emitChangeAvatar': check.avatar,
	'emitChangeDescription': check.description,
	'emitChangeState': check.state,
	'emitDestroyGroup': () => true,
	'joinUpdate': check.joinRoom,
	'joinUser': check.joinUser,
	'joinGroup': check.joinGroup,
	'removeRoom': check.removeRoom,
	'createGroup': check.groupInit,
	'emitDestroyUser': () => true
};
