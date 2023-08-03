import type { IUser } from '../types/global.js';
import jwt from 'jsonwebtoken';
import { SECRET } from '../config.js';
import { User } from '../models/index.js';

export const socketValid = async (token: string): Promise<IUser | undefined> => {
	try {
		const decoded = jwt.verify(token, SECRET) as jwt.JwtPayload;
		const user = await User.findOne({ _id: decoded.id });

		if (user === null) throw 'Error';

		return user;
	}
	catch {
		return undefined;
	}
};
