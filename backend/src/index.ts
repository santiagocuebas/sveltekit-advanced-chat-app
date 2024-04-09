import { Server } from 'socket.io';
import mongoose from 'mongoose';
import { createAdapter } from '@socket.io/mongo-adapter';
import server from './app.js';
import {
	PORT,
	ORIGIN,
	MONGO_URI,
	MONGO_REPLIC,
	MONGO_DB,
	MONGO_COLLECTION
} from './config.js';
import initSocket from './socket-io.js';
import { verifyToken } from './libs/index.js';
import { Group, User } from './models/index.js';

// Create Server
const { MongoClient } = mongoose.mongo;
const mongoClient = new MongoClient(MONGO_REPLIC, { directConnection: true });

// Connect Databases
await mongoClient
	.connect()
	.then(() => console.log('MongoDB Cluster is Connected'))
	.catch(err => console.error('An error has occurred with', err));

await mongoClient
	.db(MONGO_DB)
	.createCollection(MONGO_COLLECTION, { capped: true, size: 1e6 })
	.then(() => console.log('The collection has been created successfully'))
	.catch(() => console.error('The collection exists'));

mongoose.set('strictQuery', true);

await mongoose
	.connect(MONGO_URI)
	.then(() => console.log('MongoDB Database is Connected'))
	.catch(err => console.error('An error has occurred with', err));

await User.updateMany({ }, { logged: false, tempId: '', socketIds: [] });
await Group.updateMany({ }, { loggedUsers: [] });

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
		
io.use(async (socket, next) => {
	const { sessionID, token } = socket.handshake.auth;
	const user = await verifyToken(token)
		.catch(() => null);

	if (!user || user.id !== sessionID) return(new Error('Unauthorized'));

	socket.user = user;
	socket.user.tempId = token;
	
	return next();
});

io.on('connection', initSocket);

// Listener Server
server.listen(PORT, () => console.log('Server running in port', PORT));
