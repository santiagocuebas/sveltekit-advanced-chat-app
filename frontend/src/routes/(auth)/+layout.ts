import type { LayoutLoad } from './$types';

export const load = (async ({ url }) => {
	return {
		path: url.pathname
	};
}) satisfies LayoutLoad;