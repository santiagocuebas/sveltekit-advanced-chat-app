import type { ChoiceSocket, Member } from "$lib/types/global";
import {
	addMembers,
	addMods,
	banMembers,
	blockMembers,
	changeAvatar,
	removeMods,
	unblockMembers
} from "$lib/sockets";
import { user } from "$lib/store";

export const socketResult: ChoiceSocket = ({ contactID, name }) => {
	return {
		leave: () => [],
		blockGroup: () => {
			user.blockContact({ id: contactID, name }, 'groups');

			return [name];
		},
		add: (members: Member[]) => {
			addMembers(contactID, members);
			
			return [members, contactID];
		},
		ban: (banIDs: string[]) => {
			banMembers(contactID, banIDs);
			
			return [banIDs, contactID];
		},
		block: (blockUsers: Member[]) => {
			blockMembers(contactID, blockUsers);
			
			return [blockUsers, contactID];
		},
		unblock: (unblockIDs: string[]) => {
			unblockMembers(contactID, unblockIDs);
			
			return [unblockIDs, contactID]
		},
		addMod: (newMods: Member[]) => {
			addMods(contactID, newMods);

			return [newMods, contactID];
		},
		removeMod: (removeMod: Member[]) => {
			removeMods(contactID, removeMod);

			return [removeMod, contactID];
		},
		avatar: (avatar: string) => {
			changeAvatar(contactID, avatar);

			return [avatar, contactID];
		},
		description: (description: string) => [description],
		state: (state: string) => [state],
		destroy: () => []
	}
};
