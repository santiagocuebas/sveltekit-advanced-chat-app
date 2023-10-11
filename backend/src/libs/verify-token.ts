import type { IUser } from '../types/global.js';
import jwt from 'jsonwebtoken';
import { SECRET } from '../config.js';
import { User } from '../models/index.js';

export const verifyToken = async (token: string): Promise<IUser | null> => {
	try {
		const decoded = jwt.verify(token, SECRET) as jwt.JwtPayload;
		return await User.findOne({ _id: decoded.id });
	}
	catch {
		return null;
	}
};
