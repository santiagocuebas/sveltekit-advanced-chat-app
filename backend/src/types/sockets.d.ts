import type { Socket } from 'socket.io';
import type { IUser } from './global.js';

export type ChatSockets = (
  socket: Socket,
  IDs: string[],
  type?: string,
  name?: string
) => void;

export type UserSockets = (socket: Socket, IDs: string[], user: IUser) => void;

export type MemberSockets = (socket: Socket, IDs: string[], user: IUser) => void;

export type ModSockets = (socket: Socket, id: string) => void;

export type AdminSockets = (socket: Socket, IDs: string[]) => void;

export type GenericSockets = (socket: Socket, id: string, user: IUser) => void;
