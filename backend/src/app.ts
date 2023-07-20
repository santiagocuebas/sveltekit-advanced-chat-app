import express from 'express';
import morgan from 'morgan';
import multer from 'multer';
import bodyParser from 'body-parser';
import cors from 'cors';
import passport from 'passport';
import http from 'http';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { ORIGIN } from './config.js';
import { sessionMiddleware } from './middlewares/session.js';
import './middlewares/passport.js';

// Index Routes
import * as routes from './routes/index.js';

const app = express();
const server = http.createServer(app);
const __dirname: string = dirname(fileURLToPath(import.meta.url));

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors({
	origin: ORIGIN,
	methods: 'GET, POST, PUT, DELETE, OPTIONS',
	allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept',
	credentials: true
}));
app.use(multer().none());
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

// Uploads directory
app.use('/uploads', express.static(join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', routes.Auth);
app.use('/api/home', routes.Home);
app.use('/api/settings', routes.Settings);

export default server;
