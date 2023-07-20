import { Server } from 'socket.io';
import passport from 'passport';
import mongoose from 'mongoose';
import server from './app.js';
import { PORT, ORIGIN, MONGO_URI } from './config.js';
import initSocket from './socket-io.js';
import { sessionMiddleware } from './middlewares/session.js';
import { wrap } from './libs/wrap.js';

// Create Server
const io = new Server(server, {
	cors: {
		origin: ORIGIN,
		credentials: true
	}
});

// Connect Socket.io
io.use(wrap(sessionMiddleware));
io.use(wrap(passport.initialize()));
io.use(wrap(passport.session()));
	
io.use((socket, next) => {
	const sessionID = socket.handshake.auth.sessionID;
	if (socket.request.user && sessionID) return next();
	else return(new Error('Unauthorized'));
});

// io.use((socket, next) => {
// 	socket.onAny((event, ...args) => {
// 		console.log(event, args);
// 	});

// 	return next();
// });

io.on('connection', initSocket);

// Connect Database
try {
	mongoose.set('strictQuery', true);
	await mongoose.connect(MONGO_URI);
	console.log('MongoDB Database is Connected');
} catch(err) {
	console.error('An error has occurred with', err);
}

// Listener Server
server.listen(PORT, () => {
	console.log('Server running in port', PORT);
});
