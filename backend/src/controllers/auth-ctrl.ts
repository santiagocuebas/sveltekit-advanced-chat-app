import type { Direction, IKeys } from '../types/types';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { GITHUB_ID, GITHUB_SECRET, SECRET } from '../config.js';
import { encryptPassword, getUser, matchPassword } from '../libs/index.js';
import { User } from '../models/index.js';
import { TypeUser } from '../types/enums.js';

export const getData: Direction = async (req, res) => {
	const user = getUser(req.user);

	return res.json({ user });
};

export const postPassword: Direction = async (req, res) => {
	const { password } = req.body;

	// Check if is correct password
	const match = typeof password === 'string' &&
		req.user.type === TypeUser.EMAIL &&
		await matchPassword(password, req.user.password)
			.catch(err => {
				console.log(err?.message);
				return false;
			});

	console.log(password, match);

	return res.json(match);
};

export const getAccessToken: Direction = async (req, res) => {
	const params = `?client_id=${GITHUB_ID}&client_secret=${GITHUB_SECRET}&code=${req.query.code}`;

	const data: IKeys<string> | null = await axios({
		method: 'POST',
		url: 'https://github.com/login/oauth/access_token' + params,
		headers: { accept: 'application/json' }
	}).then(res => res.data)
		.catch(err => {
			console.error(err?.message);
			return null;
		});
		
	if (!data || !data.access_token) return res.json(null);
	
	const githubUserData: IKeys<string> | null = await axios({
		method: 'GET',
		url: 'https://api.github.com/user',
		headers: { 'Authorization': `${data.token_type} ${data.access_token}` }
	}).then(res => res.data)
		.catch(err => {
			console.error(err?.message);
			return null;
		});

	if (!githubUserData || !githubUserData.id) return res.json(null);
	
	// Find user
	let user = await User.findOne({ githubId: githubUserData.id });

	// Create user
	if (user === null) {
		user = await User
			.create({
				githubId: githubUserData.id,
				username: githubUserData.login,
				type: TypeUser.GITHUB
			});
	}

	// Generate token
	const token = jwt.sign({
		id: user.id,
		exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 15
	}, SECRET);
			
	const partialUser = getUser(user);
		
	return res.json({ user: partialUser, token });
};

export const postRegister: Direction = async (req, res) => {
	const { email, password }: IKeys<string> = req.body;

	// Find User
	let user = await User.findOne({ email });

	// Create user
	if (user === null) {
		const [username] = email.split('@');

		user = await User
			.create({
				username,
				email,
				password: await encryptPassword(password)
			});
	}

	// Generate token
	const token = jwt.sign({
		id: user.id,
		exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 15
	}, SECRET);
	
	const partialUser = getUser(user);

	return res.json({ user: partialUser, token });
};
