import { env } from "$env/dynamic/public";

export const DIR = env.PUBLIC_DIR as string;

console.log(DIR, env);
