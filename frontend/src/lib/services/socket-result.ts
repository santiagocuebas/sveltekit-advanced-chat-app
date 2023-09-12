import type { ChoiceSocket, Members } from "$lib/types/global";
import { groups, user } from "$lib/store";
import { TypeContact } from "$lib/types/enums";

export const socketResult: ChoiceSocket = (groupsValues, { contactID, name }) => {
	return {
		LEAVE: () => [],
		BLOCKGROUP: () => {
			user.updateBlock({
				id: contactID,
				name: name,
				type: TypeContact.GROUP
			});

			return [name];
		},
		ADD: (members: Members[]) => {
			const reloadGroup = groupsValues.map(group => {
				if (group.contactID === contactID) {
					if (group.members) group.members = [...members, ...group.members];
				}

				return group;
			});

			groups.setContacts(reloadGroup);
			
			return [members, contactID];
		},
		BAN: (banIDs: string[]) => {
			const reloadGroup = groupsValues.map(group => {
				if (group.contactID === contactID) {
					if (group.members) group.members = group.members.filter(member => !banIDs.includes(member.id));
				}

				return group;
			});

			groups.setContacts(reloadGroup);
			
			return [banIDs, contactID];
		},
		BLOCK: (blockUsers: Members[]) => {
			const reloadGroup = groupsValues.map(group => {
				if (group.contactID === contactID) {
					const blockedIDs = blockUsers.map(member => member.id);

					if (group.members) group.members = group.members.filter(member => !blockedIDs.includes(member.id));
					if (group.blacklist) group.blacklist = [...blockUsers, ...group.blacklist];
				}

				return group;
			});

			groups.setContacts(reloadGroup);
			
			return [blockUsers, contactID];
		},
		UNBLOCK: (unblockIDs: string[]) => {
			const reloadGroup = groupsValues.map(group => {
				if (group.contactID === contactID) {
					if (group.blacklist) group.blacklist = group.blacklist.filter(member => !unblockIDs.includes(member.id));
				}

				return group;
			});

			groups.setContacts(reloadGroup);
			
			return [unblockIDs, contactID]
		},
		ADDMOD: (newMods: Members[]) => {
			const reloadGroup = groupsValues.map(group => {
				if (group.contactID === contactID) {
					const modIDs = newMods.map(mods => mods.id);

					if (group.mods) group.mods = [...newMods, ...group.mods];
					if (group.members) group.members = group.members.filter(member => !modIDs.includes(member.id));
				}

				return group;
			});

			groups.setContacts(reloadGroup);

			return [newMods, contactID];
		},
		REMOVEMOD: (removeMods: Members[]) => {
			const reloadGroup = groupsValues.map(group => {
				if (group.contactID === contactID) {
					const modIDs = removeMods.map(mods => mods.id);

					if (group.members) group.members = [...removeMods, ...group.members];
					if (group.mods) group.mods = group.mods.filter(mod => !modIDs.includes(mod.id));
				}

				return group;
			});

			groups.setContacts(reloadGroup);

			return [removeMods, contactID];
		},
		AVATAR: (avatar: string) => {
			const reloadGroups = groupsValues.map(group => {
				if (group.contactID === contactID) group.avatar = avatar;
				return group;
			});
		
			groups.setContacts(reloadGroups);

			return [avatar, contactID];
		},
		DESCRIPTION: (description: string) => [description],
		STATE: (state: string) => [state],
		DESTROY: () => []
	}
};
