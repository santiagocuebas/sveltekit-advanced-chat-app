import { Server } from 'socket.io';
import mongoose from 'mongoose';
import { createAdapter } from '@socket.io/cluster-adapter';
import server from './app.js';
import { ORIGIN, MONGO_URI } from './config.js';
import initSocket from './socket-io.js';
import { verifyToken } from './libs/index.js';
import { Group, User } from './models/index.js';

console.log(`Worker ${process.pid} started`);

const PORT = process.env.PORT ?? process.pid;

// Connect Database
mongoose.set('strictQuery', true);

await mongoose
	.connect(MONGO_URI)
	.then(() => console.log('MongoDB Database is Connected'))
	.catch(err => {
		mongoose.connection.close();
		console.error('An error has occurred with', err);
	});

await User.updateMany({ }, { logged: false, tempId: '', socketIds: [] });
await Group.updateMany({ }, { loggedUsers: [] });

// Create Server
const io = new Server(server, {
	cors: {
		origin: ORIGIN,
		allowedHeaders: 'Origin, Authorization, X-Requested-With, Content-Type, Accept',
		methods: ['GET', 'POST'],
		credentials: true
	},
	connectionStateRecovery: {},
	maxHttpBufferSize: 2e7,
	transports: ['polling', 'websocket'],
	adapter: createAdapter()
});

io.engine.on('connection_error', err => {
	console.log(err?.code);
	console.log(err?.message);
	console.log(err?.context);
});

// Connect worker		
io.use(async (socket, next) => {
	const { sessionID, token } = socket.handshake.auth;
	const user = await verifyToken(token)
		.catch(() => null);

	if (!user || user.id !== sessionID) return(new Error('Unauthorized'));

	socket.user = user;
	if (user.tempId.length === 0) socket.user.tempId = token;

	return next();
});

io.on('connection', initSocket);

server.listen(PORT, () => console.log('Server listening at port', PORT));
