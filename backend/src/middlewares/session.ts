import session from 'express-session';
import MongoStore from 'connect-mongo';
import { MONGO_URI, SECRET, NODE_ENV } from '../config.js';

export const sessionMiddleware = session({
	secret: SECRET,
	resave: false,
	saveUninitialized: false,
	name: 'session.id',
	store: new MongoStore({
		mongoUrl: MONGO_URI,
		ttl: 60 * 60 * 24 * 14
	}),
	cookie: {
		httpOnly: true,
		sameSite: 'lax',
		secure: NODE_ENV === 'production'
	}
});
