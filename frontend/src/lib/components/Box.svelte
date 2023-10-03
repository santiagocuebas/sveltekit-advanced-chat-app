<script lang="ts">
  import type { IKeys } from "$lib/types/global";

	export let success: boolean = false;
	export let errors: boolean = false;
	export let message: string | IKeys<string>;
</script>

<div class:success={success} class:errors={errors}>
	{#if typeof message === 'string'}
		{message}
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
		@apply self-end justify-self-end flex absolute flex-wrap items-center justify-center mr-2.5 mb-2.5 p-2.5 overflow-y-auto rounded-2xl;
	}

	.success {
		border: 2px solid #0b7c24;
		background-color: #b0ecb3;
		font-size: 20px;
		@apply text-center font-semibold;
	}

	.errors {
		grid-auto-rows: min-content;
		border: 2px solid #7c0b0b;
		background-color: #ecb0b0;
		@apply items-start gap-1.5;
	}
</style>
