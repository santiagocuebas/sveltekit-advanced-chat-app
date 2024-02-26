import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load = (async ({ cookies, url }) => {
	const token = cookies.get('authenticate');
	const pathname = url.pathname;

	if (!token && !pathname.includes('register')) {
		throw redirect(307, '/register');
	}

	return {};
}) satisfies LayoutServerLoad;
