<script lang="ts">
  import type { IKeys } from "$lib/types/global";
  import { onMount } from "svelte";

	export let visible: boolean;
	export let className: string;
	export let message: string | IKeys<string>;

	onMount(() => setTimeout(() => visible = false, 5000));
</script>

<div class={className}>
	{#if typeof message === 'string'}
		<p>{message}</p>
		{:else}
		{#each Object.entries(message) as [key, value]}
			<p><strong>{key}</strong>: {value}</p>
		{/each}
	{/if}
</div>

<style lang="postcss">
	div {
		width: 200px;
		height: 200px;
		scrollbar-width: none;
		z-index: 500;
		@apply absolute justify-self-end self-end mr-2.5 mb-2.5 p-2.5 overflow-y-auto rounded-2xl;
	}

	.success-settings {
		border: 2px solid #0b7c24;
		background-color: #b0ecb3;
	}

	.success-settings p {
		@apply text-center font-semibold;
	}

	.errors-settings {
		grid-auto-rows: min-content;
		border: 2px solid #7c0b0b;
		background-color: #ecb0b0;
		@apply grid gap-1;
	}
</style>
