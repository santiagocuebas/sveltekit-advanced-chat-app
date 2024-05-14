import { UpdateQuery } from 'mongoose';
import { User } from '../models/index.js';
import { IUser } from '../types/global.js';

export const queryResult = async (
	id: string,
	query: UpdateQuery<IUser>,
	filename?: string
): Promise<[number, boolean, string, string?]> => {
	const resultQuery = await User
		.updateOne({ _id: id }, query)
		.catch(() => null);

	return resultQuery !== null
		? [200, true, 'Your user has been successfully updated', filename]
		: [401, false, 'A database error occurred while attempting to update the user'];
};
