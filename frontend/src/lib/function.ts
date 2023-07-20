import type { ILoaded, IError } from './global.js';

export function isLoaded(object: ILoaded | IError): object is ILoaded {
	return (object as ILoaded).image !== undefined;
}
