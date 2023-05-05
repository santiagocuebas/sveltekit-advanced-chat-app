import bcrypt from 'bcrypt';

export const encryptPassword = async (pass: string): Promise<string> => {
	const salt = await bcrypt.genSalt(10);
	return await bcrypt.hash(pass, salt);
};

export const matchPassword = async (pass: string, savedPass: string): Promise<boolean> => {
	return bcrypt.compare(pass, savedPass);
};
