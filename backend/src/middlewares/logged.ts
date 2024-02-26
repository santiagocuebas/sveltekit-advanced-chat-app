import type { Direction } from '../types/types.js';
import { verifyToken } from '../libs/index.js';

export const isValidToken: Direction = async (req, res, next) => {
	// Getting and decoding the token and find the user
	const token = req.headers['authorization'] ?? '';
	const user = await verifyToken(token)
		.catch(() => null);

	if (user !== null) {
		req.user = user;
		return next();
	}

	return res.status(401).json({ error: 'loggedError' });
};

export const isNotValidToken: Direction = async (req, res, next) => {
	// Getting and decoding the token and find the user
	const token = req.headers['authorization'] ?? '';
	const user = await verifyToken(token)
		.catch(() => null);
	
	if (user === null) return next();
	
	return res.status(401).json({ error: 'notLoggedError' });
};
