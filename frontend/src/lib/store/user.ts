import type { Blacklist, IUser } from "$lib/global";

function createUser() {
	let user: IUser;
	
	return {
		getUser: () => user,
		updateBlock: (value: Blacklist) => {
			user.blacklist.push(value);

			return user;
		},
		setUser: (value: IUser) => user = value
	}
}

export const userData = createUser();
