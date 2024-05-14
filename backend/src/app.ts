import express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import cors from 'cors';
import { createServer } from 'http';
import { join } from 'path';
import { ORIGIN } from './config.js';
import { __dirname } from './upload.js';

// Index Routes
import * as routes from './routes/index.js';

// Initializations
const app = express();
const server = createServer(app);

// Middlewares
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors({
	origin: ORIGIN,
	methods: 'GET, POST, PUT, DELETE, OPTIONS',
	allowedHeaders: 'Origin, Authorization, X-Requested-With, Content-Type, Accept',
	credentials: true
}));

// Uploads directory
app.use('/uploads', express.static(join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', routes.Auth);
app.use('/api/home', routes.Home);
app.use('/api/settings', routes.Settings);

export default server;
