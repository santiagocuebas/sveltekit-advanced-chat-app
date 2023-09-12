import type { ILoaded, IError } from '../types/global.js';

export function isLoaded(object: ILoaded | IError): object is ILoaded {
	return (object as ILoaded).image !== undefined;
}
