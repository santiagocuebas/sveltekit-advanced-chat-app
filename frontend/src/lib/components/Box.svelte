<script lang="ts">
  import type { IKeys } from "$lib/types/global";

	export let success: boolean = false;
	export let message: string | IKeys<string>;
</script>

<div class:success={success} class:errors={!success}>
	{#if typeof message === 'string'}
		<strong>{message}</strong>
	{:else}
		{#each Object.entries(message) as [key, value]}
			<p>
				<strong>{key}</strong>: {value}
			</p>
		{/each}
	{/if}
</div>

<style lang="postcss">
	div {
		scrollbar-width: none;
		@apply self-end justify-self-end flex absolute flex-col justify-center w-[240px] h-[240px] mr-2.5 mb-2.5 p-2.5 overflow-y-auto rounded-2xl z-[500];
	}

	.success {
		border: 2px solid #0b7c24;
		@apply bg-[#b0ecb3] text-center font-semibold text-[20px];
	}

	.errors {
		border: 2px solid #7c0b0b;
		@apply items-start bg-[#ecb0b0] gap-1.5;
	}
</style>
