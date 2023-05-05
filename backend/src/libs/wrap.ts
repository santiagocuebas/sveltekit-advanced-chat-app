/* eslint-disable @typescript-eslint/no-explicit-any */
import { Socket } from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace';

export const wrap = (middleware: any) => {
	return (socket: Socket, next: (err?: ExtendedError | undefined) => void) => {
		return middleware(socket.request, {}, next);
	};
};
