/* eslint-disable @typescript-eslint/no-empty-interface */
import { Request, Response, NextFunction } from 'express';
import { Session } from 'express-session';
import { Types } from 'mongoose';

declare global {
	namespace Express {
		interface User extends IUser {}
	}
}

declare module 'http' {
	interface IncomingMessage {
		session: Session;
		user: IUser
	}
} 

export type Direction = (req: Request, res: Response, next: NextFunction) => void;

export interface IChat {
	_id: Types.ObjectId;
	from: string;
	body: string;
	createdAt: Date;
}

export interface IUser {
	_id: Types.ObjectId;
	email: string;
	password: string;
	username: string;
	avatar: string;
	description: string;
	contacts: Types.ObjectId[];
	createdAt: Date;
}

export interface IContact {
	userId: string;
	email: string;
	username: string;
	avatar: string;
	description: string;
}

export interface Error {
	[index: string]: string;
}
