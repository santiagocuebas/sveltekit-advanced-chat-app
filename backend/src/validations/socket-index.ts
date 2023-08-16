import type { IUser } from '../types/global.js';
import type { ArgsType, IKeys } from '../types/types.js';
import * as check from './socket-validations.js';

export const socketIndex: IKeys<(value: ArgsType[], user: IUser) => true | IKeys<string> | Promise<true | IKeys<string>>> = {
	'joinRoom': check.join,
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
	'emitChangeState': check.state,
	'emitDestroyGroup': () => true,
	'joinUpdate': check.joinRoom,
	'joinUser': check.joinUser,
	'joinGroup': check.joinGroup,
	'createGroup': check.groupInit,
	'emitDestroyUser': () => true
};
