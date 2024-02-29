import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT as string;

export const SECRET = process.env.SECRET as string;

export const ORIGIN = process.env.ORIGIN;

export const GITHUB_ID = process.env.GITHUB_ID;

export const GITHUB_SECRET = process.env.GITHUB_SECRET;

export const MONGO_URI = process.env.MONGO_URI as string;

export const MONGO_REPLIC = process.env.MONGO_REPLIC as string;

export const SOCKETS_DB = process.env.SOCKETS_DB;

export const COLLECTION = process.env.COLLECTION as string;
