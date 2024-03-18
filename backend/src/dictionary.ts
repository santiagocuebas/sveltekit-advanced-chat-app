import { IKeys } from './types/types';

export const ErrorMessage: IKeys<IKeys<string>> = {
	connectRoom: {
		error: 'Join Error',
		message: 'An error occurred while trying to join'
	},
	createChat: { error: 'Chat Error', message: 'The chat content is invalid' },
	deleteChat: { error: 'Chat Error', message: 'The id is invalid' },
	blockGroup: { error: 'Group Error', message: 'The id or name is invalid' },
	addMembers: {
		error: 'Group Error',
		message: 'An error occurred while trying to join the user'
	},
	banMembers: {
		error: 'Group Error',
		message: 'An error occurred while trying ban the user'
	},
	blockMembers: {
		error: 'Group Error',
		message: 'An error occurred while trying block the user'
	},
	unblockMembers: {
		error: 'Group Error',
		message: 'An error occurred while trying unblocking the user'
	},
	addMods: {
		error: 'Group Error',
		message: 'An error occurred while trying add the mod'
	},
	removeMods: {
		error: 'Group Error',
		message: 'An error occurred while trying remove the mod'
	},
	avatar: { error: 'Avatar Error', message: 'The avatar is invalid' },
	description: { error: 'Description Error', message: 'The description is invalid' },
	state: { error: 'State Error', message: 'The state is invalid' },
	unblock: { error: 'Unblock Error', message: 'Please reload the page' },
	removeRoom: {
		error: 'Join Error',
		message: 'An error occurred while trying delete to room'
	},
	groupInit: {
		error: 'Group Error',
		message: 'An error occurred while trying to create the group'
	},
	socketError: { error: 'Socket Error', message: 'The socket emitted no exist' }
};
