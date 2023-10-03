import type { Direction } from '../types/types';
import { serialize } from 'cookie';
import type { IUser } from '../types/global.js';
import { DOMAIN, NODE_ENV } from '../config.js';
import { encryptPassword, getSerializedCookie, getUser } from '../libs/index.js';
import { User } from '../models/User.js';

export const postRegister: Direction = async (req, res) => {
	// Create user
	const user = await User
		.create({
			username: req.body.username,
			email: req.body.email,
			password: await encryptPassword(req.body.password)
		});

	// Seriialized cookie
	const token = getSerializedCookie(user.toJSON());

	// Set cookie authenticate
	res.set('Set-Cookie', token);
	
	const partialUser = getUser(user);

	return res.json({ user: partialUser });
};

export const postSignin: Direction = async (req, res) => {
	// Search user
	const user = await User.findOne({ email: req.body.email });

	// Seriialized cookie
	const token = getSerializedCookie(user?.toJSON() as IUser);

	// Set cookie authenticate
	res.set('Set-Cookie', token);
	
	const partialUser = getUser(user as IUser);

	return res.json({ user: partialUser });
};

export const postLogout: Direction = async (_req, res) => {
	// Delete cookie authenticate
	res.set('Set-Cookie', serialize('authenticate', '', {
		domain: DOMAIN,
		httpOnly: true,
		maxAge: 0,
		path: '/',
		sameSite: 'lax',
		secure: NODE_ENV === 'production'
	}));

	return res.json({ logout: true });
};
