import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { IUser } from '../global.js';
import { encryptPassword } from '../libs/bcrypt.js';
import { User } from '../models/User.js';

passport.use(
	'register',
	new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password',
		passReqToCallback: true
	},
	async (req, email, password, done) => {
		const user = await User.create({
			username: req.body.username,
			email,
			password: await encryptPassword(password)
		});

		return done(null, user);
	})
);

passport.use(
	'signin',
	new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password'
	},
	async (email, _password, done) => {
		const user = await User.findOne({ email }) as IUser;

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
