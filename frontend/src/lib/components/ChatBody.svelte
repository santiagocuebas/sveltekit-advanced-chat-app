<script lang="ts">
  import type { IChat } from "$lib/types/global";
  import { afterUpdate, beforeUpdate, onMount } from "svelte";
	import validator from 'validator';
  import { getDate } from "$lib/services";
  import { socket } from "$lib/socket";
  import { user, options } from "$lib/store";
  import { Option } from "$lib/types/enums";

  export let id: string;
	export let visibleChats: IChat[];
  export let handleImage: (this: HTMLImageElement) => void;

	const	observer = new IntersectionObserver(showMoreChats, {
		root: null,
		rootMargin: '0px',
	});
	let div: HTMLElement;
	let autoscroll: boolean;
	let boxElement: HTMLElement | null;
	let chatID: string | undefined;
	let counter = 0;
	let chats: IChat[] = [];

	function handleDelete(chatID: string, from: string) {
		if ($user.id === from) {
			id = chatID;
			options.setOption(Option.CHAT);
		}
	}

	function showMoreChats([entry]: IntersectionObserverEntry[]) {
		if (entry?.isIntersecting) showChats(counter+10);
	}

	function showChats(num: number) {
		for (counter; (counter < num && counter < chats.length); counter++) {
			visibleChats = [chats[counter], ...visibleChats];
		}

		if (boxElement) observer.unobserve(boxElement);
		chatID = visibleChats.at(-1)?._id;
	}

	const loadChats = (messages: IChat[]) => {
		div.scrollTo(0, div.scrollHeight);
		counter = 0;
		chats = messages.reverse();
		visibleChats = [];
		showChats(10);
	};
	
	const loadChatID = (id: string, tempID: string) => {
		visibleChats = visibleChats.map(chat => {
			if (chat._id === tempID) chat._id = id;
			return chat;
		});
	};

  onMount(() => {
		socket.on('loadChats', loadChats);
		socket.on('loadChatID', loadChatID);

		return () => {
			socket.off('loadChats', loadChats);
			socket.off('loadChatID', loadChatID);
		};
	});

	beforeUpdate(() => {
		autoscroll = div && div.offsetHeight + div.scrollTop > div.scrollHeight - 50;
	});

	afterUpdate(() => {
		if (autoscroll) div.scrollTo(0, div.scrollHeight);

		if (chatID) {
			boxElement = document.getElementById(chatID);
			if (boxElement) observer.observe(boxElement);
		}
	});
</script>

<div class="chats" bind:this={div}>
	{#each visibleChats as chat (chat._id)}
		<div
			id={chat._id}
			class:me={$user.id === chat.from}
			on:dblclick={() => handleDelete(chat._id, chat.from)}
			role='none'
		>
			{#if chat.username}
				<h3>
					{chat.username}
				</h3>
			{/if}
			{#if (chat.content instanceof Array)}
				{#each chat.content as image (image)}
					<img src={image} alt={chat._id} on:click={handleImage} role='none'>
				{/each}
			{:else if validator.isURL(chat.content)}
				<a href='{chat.content}' target="_blank">
					{chat.content}
				</a>
			{:else}
				<p>
					{@html chat.content}
				</p>
			{/if}
			<p class="left">
				{getDate(chat.createdAt)}
			</p>
		</div>
	{/each}
</div>

<style lang="postcss">
  .chats {
		grid-column: 2 / span 1;
		grid-row: 2 / span 1;
		grid-auto-rows: min-content;
		background-image: url('/smiley.jpg');
		scrollbar-width: none;
		@apply grid w-full p-4 bg-no-repeat bg-cover overflow-y-auto gap-y-3;

		& div {
			box-shadow: 0 0 2px #888888;
			@apply flex flex-wrap justify-around w-fit min-w-[260px] max-w-[60%] p-2.5 bg-white rounded-md gap-0.5 select-none [&.me]:ml-auto [&_.left]:text-right;
		}
	}
	
	img {
		@apply w-60 h-60 object-cover object-top cursor-pointer;
	}

	h3 {
		@apply font-semibold;
	}

	h3, p, a {
		@apply w-full overflow-hidden leading-tight break-words;
	}

	a {
		@apply w-min mr-auto text-[#346eb1] hover:text-[#7b24a3];
	}
</style>
