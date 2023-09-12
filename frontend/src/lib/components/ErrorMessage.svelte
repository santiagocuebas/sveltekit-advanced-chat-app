<script lang="ts">
	import type { IKeys } from "$lib/types/global";
  import { onMount } from "svelte";

	export let error: IKeys<string> | null;

	onMount(() => setTimeout(() => error = null, 5000));
</script>

<div>
	<h3>{error?.error}</h3>
	<p>{error?.message}</p>
</div>

<style lang="postcss">
	div {
		grid-column: 2 / span 1;
		grid-row: 2 / span 1;
		width: 200px;
		border: 2px solid #9c1313;
		background-color: #f1b1b1;
		z-index: 400;
		@apply grid absolute justify-items-center self-end justify-self-center m-1 p-2.5 rounded-2xl gap-1;
	}

	h3 {
		@apply w-full overflow-hidden break-words text-center text-2xl leading-none;
	}

	p {
		@apply w-full overflow-hidden break-words text-center text-xl leading-none;
	}
</style>