import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import { SECRET, NODE_ENV, DOMAIN } from '../config.js';
import { IUser } from '../types/global.js';

export const getSerializedCookie = ({ id }: IUser): string => {
	const token = jwt.sign({
		id,
		exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 15
	}, SECRET);

	return serialize('authenticate', token, {
		domain: DOMAIN,
		httpOnly: true,
		maxAge: 60 * 60 * 24 * 15,
		path: '/',
		sameSite: 'lax',
		secure: NODE_ENV === 'production'
	});
};
