import type { Blacklist, Users } from '../types/global.js';
import type { IOption } from '../types/types.js';
import { User } from '../models/index.js';

export const updateUser = async (
	userID: string,
	contactID: string,
	contacts: Users[],
	blacklist?: Blacklist[]
) => {
	const options: IOption = { users: [] };
	
	for (const user of contacts) {
		if (user.userID !== contactID) options.users.push(user);
	}

	if (blacklist) options.blacklist = blacklist;

	await User.updateOne({ _id: userID }, options);
};
