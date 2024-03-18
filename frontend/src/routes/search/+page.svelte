<script lang="ts">
	import type { ResponseData } from '$lib/types/global';
	import { afterNavigate } from '$app/navigation';
	import { onMount } from 'svelte';
	import axios from '$lib/axios';
  import { selectCreate } from "$lib/dictionary";
  import { socket } from "$lib/socket";
	import { contact, contacts } from '$lib/store';

	function createRoom(id: string, type: string) {
		socket.emit(selectCreate[type], id);
	}

	onMount(async () => {
		const queryString = location.search;
		const urlParams = new URLSearchParams(queryString);
		const searchParam = urlParams.get('q');

		if (!$contacts.list.length && searchParam) {
			const data: ResponseData = await axios({ url: '/home/search/' + searchParam })
				.then(res => res.data)
				.catch(err => err.response?.data ?? { });

			if (data.contacts) contacts.setLists(data.contacts);
		}
	});
	
	afterNavigate(() => {
		contact.resetContact();
		socket.emit('removeListeners');
	});
</script>

<ul>
	{#if $contacts.list.length}
		{#each $contacts.list as item (item.contactID+item.type)}
			<li class="item">
				<picture>
					<img src={item.avatar} alt={item.contactID}>
				</picture>
				<h2 title={item.name}>{item.name}</h2>
				{#if item.description}
					<p class="content">{item.description}</p>
				{/if}
				<div>
					<button on:click={() => createRoom(item.contactID, item.type)}>
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
		@apply flex flex-col justify-start relative bg-white overflow-y-auto;
	}

  .item {
		grid-template-columns: min-content 1fr min-content;
		grid-auto-rows: 50%;
		border-bottom: 2px solid #999999;
		@apply self-start grid items-center w-full p-3 font-medium gap-x-1.5 [&_.content]:h-[35px];

		& picture {
			grid-row: 1 / span 2;
			@apply w-16 h-16;
		}

		& img {
			box-shadow: 0 0 4px #777777;
			@apply w-full h-full rounded-full object-cover object-center;
		}

		& p, h2 {
			@apply overflow-hidden break-words;
		}

		& h2 {
			@apply h-5 text-lg font-semibold leading-none;
		}

		& div {
			grid-column: 3 / span 1;
			grid-row: 1 / span 2;
		}

		& button {
			@apply px-6 py-2 bg-[#3d7cf1] rounded-2xl text-[20px] font-bold text-white;
		}
	}

	.no-item {
		@apply flex flex-wrap w-full py-2.5 font-semibold;

		& p { 
			@apply w-full text-center text-xl break-words;
		}
	}

</style>
