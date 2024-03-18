import type { ChoiceSocket, Member } from "$lib/types/global";
import { sendAvatar } from "./index";
import { contacts, groupProps, user } from "$lib/store";

export const socketResult: ChoiceSocket = ({ contactID, name }) => {
	return {
		leave: () => [],
		blockGroup: () => {
			user.blockContact({ id: contactID, name }, 'groups');

			return [name];
		},
		add: (members: Member[]) => {
			contacts.addMembers(contactID, ...members);
			
			return [members, contactID];
		},
		ban: (banIDs: string[]) => {
			contacts.banMembers(contactID, ...banIDs);
			
			return [banIDs, contactID];
		},
		block: (blockUsers: Member[]) => {
			contacts.blockMembers(contactID, ...blockUsers);
			
			return [blockUsers, contactID];
		},
		unblock: (unblockIDs: string[]) => {
			contacts.unblockMembers(contactID, ...unblockIDs);
			
			return [unblockIDs, contactID]
		},
		addMod: (newMods: Member[]) => {
			contacts.addMods(contactID, ...newMods);

			return [newMods, contactID];
		},
		removeMod: (removeMod: Member[]) => {
			contacts.removeMods(contactID, ...removeMod);

			return [removeMod, contactID];
		},
		avatar: async (avatar: string): Promise<string[]> => {
			const filename = await sendAvatar(avatar, contactID);

			if (filename) {
				contacts.changeAvatar(contactID, filename);
				groupProps.changeAvatar(filename);
			}

			return [filename, contactID];
		},
		description: (description: string) => {
			contacts.changeDescription(contactID, description);

			return [description];
		},
		state: (state: string) => {
			contacts.changeState(contactID, state);

			return [state];
		},
		destroy: () => []
	}
};
