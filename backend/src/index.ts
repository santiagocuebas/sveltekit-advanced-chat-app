import { Server } from 'socket.io';
import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';
import cookieParser from 'cookie-parser';
import { setupWorker } from '@socket.io/sticky';
import { createAdapter } from '@socket.io/mongo-adapter';
import server from './app.js';
import {
	PORT,
	ORIGIN,
	MONGO_URI,
	SOCKETS_DB,
	COLLECTION
} from './config.js';
import { wrap } from './libs/wrap.js';
import initSocket from './socket-io.js';
import { socketValid } from './libs/socket-user.js';

// Create Server
const mongoClient = new MongoClient('mongodb://127.0.0.1:27017/?replicaSet=rs0', {
	directConnection: true
});

// Connect Databases
await mongoClient.connect();

try {
	await mongoClient.db(SOCKETS_DB).createCollection(COLLECTION, {
		capped: true,
		size: 1e6
	});
	console.log('MongoDB Database one is Connected');
} catch {
	console.error('Collection already exists');
}

try {
	mongoose.set('strictQuery', true);
	await mongoose.connect(MONGO_URI);
	console.log('MongoDB Database two is Connected');
} catch(err) {
	console.error('An error has occurred with', err);
}

console.log(`Worker ${process.pid} started`);

// Connect Socket.io
const mongoCollection = mongoClient.db(SOCKETS_DB).collection(COLLECTION);

const io = new Server(server, {
	cors: {
		origin: ORIGIN,
		methods: ['GET', 'POST', 'PUT', 'DELETE'],
		credentials: true
	},
	adapter: createAdapter(mongoCollection)
});

setupWorker(io);

io.use(wrap(cookieParser()));
		
io.use(async (socket, next) => {
	const sessionID = socket.handshake.auth.sessionID;
	const user = await socketValid(socket.request.cookies['authenticate']);

	if (user && sessionID) {
		socket.user = user;
		return next();
	} else return(new Error('Unauthorized'));
});
	
io.use((socket, next) => {
	socket.onAny((event, ...args) => {
		console.log(event, args);
	});
	
	return next();
});
	
io.on('connection', initSocket);

// Listener Server
server.listen(PORT, () => console.log('Server running in port', PORT));

