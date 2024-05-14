import bcrypt from 'bcrypt';

export const encryptPassword = async (pass: string) => {
	const salt = await bcrypt.genSalt(10);
	return await bcrypt.hash(pass, salt);
};

export const matchPassword = async (pass: string, savedPass: string) => {
	return bcrypt.compare(pass, savedPass);
};
