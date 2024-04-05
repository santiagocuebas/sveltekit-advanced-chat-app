import { Server } from 'socket.io';
import mongoose from 'mongoose';
import { createAdapter } from '@socket.io/mongo-adapter';
import server from './app.js';
import { cloudinaryConfig } from './cloudinary.js';
import {
	PORT,
	ORIGIN,
	MONGO_URI,
	MONGO_REPLIC,
	MONGO_DB,
	MONGO_COLLECTION
} from './config.js';
import { verifyToken, wrap } from './libs/index.js';
import initSocket from './socket-io.js';

// Create Server
const { MongoClient } = mongoose.mongo;
const mongoClient = new MongoClient(MONGO_REPLIC);

// Connect Databases
await mongoClient
	.connect()
	.then(() => console.log('MongoDB Cluster is Connected'))
	.catch(err => console.error('An error has occurred with', err));

mongoose.set('strictQuery', true);

await mongoose
	.connect(MONGO_URI)
	.then(() => console.log('MongoDB Database is Connected'))
	.catch(err => console.error('An error has occurred with', err));

// Connect Socket.io
const mongoCollection = mongoClient.db(MONGO_DB).collection(MONGO_COLLECTION);

const io = new Server(server, {
	cors: {
		origin: ORIGIN,
		allowedHeaders: ['Origin', 'Authorization', 'X-Requested-With', 'Content-Type', 'Accept'],
		methods: ['GET', 'POST', 'PUT', 'DELETE'],
		credentials: true
	},
	maxHttpBufferSize: 2e7,
	adapter: createAdapter(mongoCollection)
});

// Connect worker
io.use(wrap(cloudinaryConfig));
		
io.use(async (socket, next) => {
	const { sessionID, token } = socket.handshake.auth;
	const user = await verifyToken(token)
		.catch(() => null);

	if (!user || user.id !== sessionID) return(new Error('Unauthorized'));

	socket.user = user;
	return next();
});

io.on('connection', initSocket);

// Listener Server
server.listen(PORT, () => console.log('Server running in port', PORT));
