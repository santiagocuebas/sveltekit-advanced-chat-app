<script lang="ts">
	import type { LayoutData } from "./$types";

	export let data: LayoutData;
</script>

<div>
	<h1>{data.path === '/signin' ? 'Signin' : 'Register'}</h1>
	<slot />
</div>

<style lang="postcss">
	div {
		min-width: 450px;
		max-width: 600px;
		@apply grid relative justify-items-center items-center w-3/5 mt-5 px-5 py-40 rounded-md bg-white shadow-grey gap-5;
	}

	h1 {
		@apply text-4xl;
	}
</style>
