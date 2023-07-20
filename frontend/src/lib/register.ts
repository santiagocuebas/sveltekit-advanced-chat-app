import type { IKeys } from "./global.js";

export class DataSignin<Type> implements IKeys<Type> {
	[key: string]: Type;

	constructor(email: Type, password: Type) {
		this.email = email;
		this.password = password;
	}
}

export class DataRegister<Type> extends DataSignin<Type> implements IKeys<Type> {
	[key: string]: Type;

	constructor(username: Type, email: Type, password: Type, confirmPassword: Type) {
		super(email, password);
		this.username = username;
		this.confirmPassword = confirmPassword;
	}
}
