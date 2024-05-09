import { Server } from 'socket.io';
import mongoose from 'mongoose';
import { setupWorker } from '@socket.io/sticky';
import { createAdapter } from '@socket.io/mongo-adapter';
import { createServer } from 'http';
import app from './app.js';
import {
	ORIGIN,
	MONGO_URI,
	MONGO_REPLIC,
	MONGO_DB,
	MONGO_COLLECTION
} from './config.js';
import initSocket from './socket-io.js';
import { verifyToken } from './libs/index.js';
import { Group, User } from './models/index.js';

// Index Routes
import * as routes from './routes/index.js';

console.log(`Worker ${process.pid} started`);

// Create Server
const { MongoClient } = mongoose.mongo;
const mongoClient = new MongoClient(MONGO_REPLIC);

// Connect Databases
await mongoClient
	.connect()
	.then(() => console.log('MongoDB Cluster is Connected'))
	.catch(err => {
		mongoClient.close();
		console.error('An error has occurred with', err);
	});

mongoose.set('strictQuery', true);

await mongoose
	.connect(MONGO_URI)
	.then(() => console.log('MongoDB Database is Connected'))
	.catch(err => {
		mongoose.connection.close();
		console.error('An error has occurred with', err);
	});

// Connect Socket.io
const mongoCollection = mongoClient.db(MONGO_DB).collection(MONGO_COLLECTION);

const server = createServer(app);

const io = new Server(server, {
	cors: {
		origin: ORIGIN,
		methods: ['GET', 'POST'],
		credentials: true
	},
	connectionStateRecovery: {
		maxDisconnectionDuration: 2 * 60 * 1000,
		skipMiddlewares: true
	},
	maxHttpBufferSize: 2e7,
	transports: ['polling', 'websocket']
});

io.adapter(createAdapter(mongoCollection));

setupWorker(io);

io.engine.on('connection_error', (err) => {
	console.log(err?.code);
	console.log(err?.message);
	console.log(err?.context);
});

await User.updateMany({ }, { logged: false, tempId: '', socketIds: [] });
await Group.updateMany({ }, { loggedUsers: [] });

// Connect worker		
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

// Routes
app.use('/api/auth', routes.Auth);
app.use('/api/home', routes.Home);
app.use('/api/settings', routes.Settings);
