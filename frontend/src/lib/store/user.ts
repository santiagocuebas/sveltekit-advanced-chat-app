import type { Member, IUser, RawUser, IKeys } from "$lib/types/global";
import { writable } from "svelte/store";

function createUser(data: IUser) {
	const { subscribe, update, set } = writable(data);

	return {
		subscribe,
		updateAvatar: (avatar: string) => update(user => {
			return { ...user, avatar };
		}),
		updateUsername: (username?: string) => update(user => {
			return { ...user, username };
		}),
		changeDescription: (description?: string) => update(user => {
			return { ...user, description };
		}),
		unblockContact: ({ users, groups }: IKeys<string[]>) => update(user => {
			if (user.blocked) {
				user.blocked = {
					users: user.blocked.users.filter(({ id }) => !users.includes(id)),
					groups: user.blocked.groups.filter(({ id }) => !groups.includes(id))
				}
			}

			return user;
		}),
		blockContact: (value: Member, prop: string) => update(user => {
			if (user.blocked) user.blocked[prop].push(value);

			return user;
		}),
		setUser: (value: RawUser) => {
			const user: IUser = {
				id: value.id,
        username: value.username,
				type: value.type,
        avatar: value.avatar,
        description: value.description,
        blocked: {
					users: value.blockedUsers,
          groups: value.blockedGroups
				}
			};

			set(user);
		},
		resetUser: () => set({ })
	}
}

export const user = createUser({ });
