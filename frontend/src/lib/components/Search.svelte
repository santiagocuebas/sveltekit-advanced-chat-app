<script lang="ts">
	import type { IList } from '$lib/global';
	import { list } from '$lib/store';
	import Searched from './Searched.svelte';
	
	let listValues: IList[];

	list.subscribe(value => listValues = value as IList[]);
</script>

<ul>
	{#if listValues.length}
		{#each listValues as user}
			<Searched contact={user} />
		{/each}
		{:else}
		<li>
			<p>No item matches the search</p>
			<p>Please try again</p>
		</li>
	{/if}
</ul>

<style lang="postcss">
	ul {
		grid-column: 2 / span 1;
		grid-row: 1 / span 3;
		grid-auto-rows: min-content;
		background-color: #ffffff;
		@apply flex flex-wrap content-start relative overflow-y-auto;
	}

	li {
		@apply flex flex-wrap w-full py-2.5 font-semibold;
	}

	p { 
		@apply w-full text-center text-xl break-words;
	}
</style>
