import type { Socket } from 'socket.io';
import type { Blacklist, Users } from './global.js';

export type ChatSockets = (
	socket: Socket,
	IDs: string[],
	username: string
) => void;

export type UserSockets = (
	socket: Socket,
	IDs: string[],
	users: Users[],
	rooms: string[],
	blacklist: Blacklist[]
) => [string[], Blacklist[]];

export type MemberSockets = (
	socket: Socket,
	IDs: string[],
	rooms: string[],
	blacklist: Blacklist[]
) => [string[], Blacklist[]];

export type ModSockets = (socket: Socket, IDs: string[]) => void;

export type AdminSockets = (
	socket: Socket,
	IDs: string[],
	rooms: string[]
) => string[];

export type GenericSockets = (
	socket: Socket,
	id: string,
	username: string,
	users: Users[],
	rooms: string[]
) => [Users[], string[]];
