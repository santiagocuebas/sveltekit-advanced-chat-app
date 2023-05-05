import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT;

export const MONGO_URI = process.env.MONGO_URI as string;

export const SECRET = process.env.SECRET as string;

export const ORIGIN = process.env.ORIGIN;

export const NODE_ENV = process.env.NODE_ENV;
