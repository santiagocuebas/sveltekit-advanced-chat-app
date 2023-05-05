import { Direction } from '../global.js';

export const isLoggedIn: Direction = (req, res, next) => {
	if (req.isAuthenticated()) return next();
	return res.json({ error: 'loggedError' });
};

export const isNotLoggedIn: Direction = (req, res, next) => {
	if (!req.isAuthenticated()) return next();
	return res.json({ error: 'notLoggedError' });
};
