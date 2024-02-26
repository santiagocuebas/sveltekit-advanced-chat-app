import { env } from "$env/dynamic/public";

export const DIR = env.PUBLIC_DIR as string;

export const GITHUB_ACCESS = 'https://github.com/login/oauth/authorize?client_id=' + env.PUBLIC_GITHUB_ID;
