import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { IUser } from '../global.js';
import { encryptPassword } from '../libs/bcrypt.js';
import { User } from '../models/User.js';

passport.use(
	'register',
	new LocalStrategy({
		usernameField: 'username',
		passwordField: 'password'
	},
	async (username, password, done) => {
		let user = await User.findOne({ username });

		if (user === null) {
			user = await User.create({
				username,
				password: await encryptPassword(password)
			});
		}

		return done(null, user);
	})
);

passport.serializeUser(async (user: IUser, done) => {
	return done(null, user.username);
});

passport.deserializeUser(async (username: string, done) => {
	const user = await User.findOne({ username });
	return done(null, user);
});
