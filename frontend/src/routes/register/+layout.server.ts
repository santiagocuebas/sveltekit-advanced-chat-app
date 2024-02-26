import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load = (async ({ cookies }) => {
	const token = cookies.get('authenticate');

	if (token) throw redirect(307, '/');

	return {};
}) satisfies LayoutServerLoad;
