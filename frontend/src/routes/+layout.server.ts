import type { LayoutServerLoad } from './$types';

export const load = (async ({ cookies }) => {
	const token = cookies.get('session.id');

	return {
		logged: Boolean(token)
	};
}) satisfies LayoutServerLoad;
