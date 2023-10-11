import type { Direction } from '../types/types.js';
import { verifyToken } from '../libs/index.js';

export const isValidToken: Direction = async (req, res, next) => {
	// Getting and decoding the token and find the user
	const user = await verifyToken(req.cookies['authenticate']);

	if (user !== null) {
		req.user = user;
		return next();
	}

	return res.status(401).json({ error: 'loggedError' });
};

export const isNotValidToken: Direction = async (req, res, next) => {
	// Getting and decoding the token and find the user
	const user = await verifyToken(req.cookies['authenticate']);
	
	if (user === null) return next();
	
	return res.status(401).json({ error: 'notLoggedError' });
};
