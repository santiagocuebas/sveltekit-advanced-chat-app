import type { Direction } from '../types/types.js';
import jwt from 'jsonwebtoken';
import { SECRET } from '../config.js';
import { User } from '../models/index.js';

export const isValidToken: Direction = async (req, res, next) => {
	try {
		// Getting and decoding the token and find the user
		const token = req.cookies['authenticate'];
		const decoded = jwt.verify(token, SECRET) as jwt.JwtPayload;
		const user = await User.findOne({ _id: decoded.id });

		if (user === null) throw 'Error';

		req.user = user;

		return next();
	} catch {
		return res.status(401).json({ error: 'loggedError' });
	}
};

export const isNotValidToken: Direction = async (req, res, next) => {
	try {
		// Getting and decoding the token and find the user
		const token = req.cookies['authenticate'];
		const decoded = jwt.verify(token, SECRET) as jwt.JwtPayload;
		const user = await User.findOne({ _id: decoded.id });
	
		if (user === null) throw 'Error';
	
		return res.status(401).json({ error: 'notLoggedError' });
	} catch {
		return next();
	}
};
