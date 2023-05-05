import express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import cors from 'cors';
import multer from 'multer';
import passport from 'passport';
import http from 'http';
import { ORIGIN } from './config.js';
import { sessionMiddleware } from './middlewares/session.js';

const app = express();
const server = http.createServer(app);

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

export default server;
