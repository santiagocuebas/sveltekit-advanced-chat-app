/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Socket } from 'socket.io';
import type { ExtendedError } from 'socket.io/dist/namespace';

export const wrap = (middleware: any) => {
	return (socket: Socket, next: (err?: ExtendedError | undefined) => void) => {
		return middleware(socket.request, {}, next);
	};
};
