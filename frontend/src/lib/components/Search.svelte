<script lang="ts">
	import type { IList } from '$lib/types/global';
	import { onDestroy } from 'svelte';
	import { DIR } from '$lib/config.js';
  import { avatarURL, selectCreate } from "$lib/dictionary";
  import { socket } from "$lib/socket";
	import { list } from '$lib/store';
	
	let listValues: IList[];

	const unsubList = list.subscribe(value => listValues = value as IList[]);

	function createRoom(id: string, type: string) {
		socket.emit(selectCreate[type], id);
	}

	onDestroy(unsubList);
</script>

<ul>
	{#if listValues.length}
		{#each listValues as item (item.contactID)}
			<li class="item">
				<img 	src={DIR + avatarURL[item.type] + item.avatar} alt={item.contactID}>
				<p class="title" title={item.name}>{item.name}</p>
				{#if item.description}
					<p class="content">{item.description}</p>
				{/if}
				<div>
					<button on:click={() => createRoom(item.type, item.contactID)}>
						Join
					</button>
				</div>
			</li>
		{/each}
		{:else}
		<li class="no-item">
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

  .item {
		grid-template-columns: min-content 1fr min-content;
		grid-auto-rows: 50%;
		border-bottom: 2px solid #999999;
		@apply self-start grid items-center w-full p-3 font-medium gap-x-1.5;
	}

	.item img {
		grid-row: 1 / span 2;
		@apply w-16 h-16 rounded-full;
	}

	.item p {
		@apply overflow-hidden break-words;
	}

	.item .title {
		@apply h-5 text-lg font-semibold leading-none;
	}

	.item .content {
		height: 35px;
	}

	.item div {
		grid-column: 3 / span 1;
		grid-row: 1 / span 2;
	}

	.item button {
		border-radius: 16px;
		background-color: #3d7cf1;
		color: #ffffff;
		@apply px-4 py-2 text-xl font-bold leading-none cursor-pointer;
	}

	.no-item {
		@apply flex flex-wrap w-full py-2.5 font-semibold;
	}

	.no-item p { 
		@apply w-full text-center text-xl break-words;
	}
</style>
