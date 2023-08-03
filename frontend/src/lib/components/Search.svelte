<script lang="ts">
  import type { IList } from '$lib/global';
  import { list } from '$lib/store';
  import Searched from './Searched.svelte';
  
	let listValues: IList[];

	list.subscribe(value => listValues = value as IList[]);
</script>

<div>
  {#each listValues as user}
		<Searched contact={user} />
	{/each}
</div>

<style lang="postcss">
  div {
    grid-column: 2 / span 1;
    grid-row: 1 / span 3;
    background-color: #ffffff;
    @apply relative overflow-y-auto;
  }
</style>
