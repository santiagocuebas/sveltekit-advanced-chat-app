import { Server } from 'socket.io';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { setupWorker } from '@socket.io/sticky';
import { createAdapter } from '@socket.io/mongo-adapter';
import server from './app.js';
import {
	PORT,
	ORIGIN,
	MONGO_URI,
	MONGO_REPLIC,
	SOCKETS_DB,
	COLLECTION
} from './config.js';
import initSocket from './socket-io.js';
import { socketValid, wrap } from './libs/index.js';

// Create Server
const { MongoClient } = mongoose.mongo;
const mongoClient = new MongoClient(MONGO_REPLIC, {
	directConnection: true
});

// Connect Databases
try {
	await mongoClient.connect();
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
	maxHttpBufferSize: 1e7 * 2.1,
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
	} 
	
	return(new Error('Unauthorized'));
});

io.on('connection', initSocket);

// Listener Server
server.listen(PORT, () => console.log('Server running in port', PORT));

