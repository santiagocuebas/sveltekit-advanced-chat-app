<script lang="ts">
  import type { IChat } from "$lib/types/global";
  import { afterUpdate, beforeUpdate, onMount } from "svelte";
	import validator from 'validator';
	import { DIR } from "$lib/config";
  import { Option } from "$lib/types/enums";
	import { socket } from "$lib/socket";
  import { getDate, getImages } from "$lib/services/libs";
  import { getChat } from "$lib/services/chat-libs";
  import { editGroups } from '$lib/sockets.js';
  import { contact, user, options } from "$lib/store";
  import EditChat from "./EditChat.svelte";

	const	observer = new IntersectionObserver(showMoreChats, {
		root: null,
		rootMargin: '0px',
	});
  let id: string;
	let div: HTMLElement;
	let autoscroll: boolean;
	let boxElement: HTMLElement | null;
	let chatID = '';
	let input: HTMLInputElement;
	let counter = 0;
	let chats: IChat[] = [];
	let visibleChats: IChat[] = [];
	let img: string;
	let alt: string;

	function handleChat(data: string | string[]) {
		const chat = getChat($user, $contact, data);
		loadChat(chat);
		socket.emit('emitChat', data, chat._id);

		if ($contact.type === Option.GROUP) editGroups($contact.roomID, chat);
	}

	function sendMessage(this: HTMLFormElement) {
		const message = new FormData(this).get('message') as string;

		if (message?.length) handleChat(message);

		input.value = '';
	}

	async function sendImage(this: HTMLInputElement) {
		const filenames = await getImages(this.files);

		if (filenames !== null) handleChat(filenames);
	}

	function handleDelete(chatID: string, from: string) {
		if ($user.id === from) {
			id = chatID;
			options.setOption(Option.CHAT);
		}
	}
	
	function handleImage(this: HTMLImageElement) {
		img = this.src;
		alt = this.alt;
		options.setOption(Option.IMAGE);
	}

	function emitDelete() {
		socket.emit('emitDelete', id);
		deleteChat(id);
		options.resetOptions();
	}

	function showMoreChats([entry]: IntersectionObserverEntry[]) {
		if (entry?.isIntersecting && chats.length > counter) return showChats(50);
	}

	function showChats(num: number) {
		for (counter; counter < (counter + num); counter++) {
			if (chats[counter]) {
				visibleChats = [chats[counter], ...visibleChats];
				chatID = chats[counter]._id;
			} else {
				if (boxElement) observer.unobserve(boxElement);
				chatID = '';
				break;
			}
		}
	}

	const loadChats = (messages: IChat[]) => {
		div.scrollTo(0, div.scrollHeight);
		counter = 0;
		chats = messages.reverse();
		visibleChats = [];
		showChats(50);
	};

	const loadChat = (message: IChat) => visibleChats = [...visibleChats, message];

	const deleteChat = (id: string) => visibleChats = visibleChats.filter(({ _id }) => _id !== id);

	const loadChatID = (id: string, tempID: string) => {
		visibleChats = visibleChats.map(chat => {
			if (chat._id === tempID) chat._id = id;
			return chat;
		});
	};

  onMount(() => {
		socket.on('loadChat', loadChat);
		socket.on('loadChats', loadChats);
		socket.on('deleteChat', deleteChat);
		socket.on('loadChatID', loadChatID);

		return () => {
			socket.off('loadChat', loadChat);
			socket.off('loadChats', loadChats);
			socket.off('deleteChat', deleteChat);
			socket.off('loadChatID', loadChatID);
		};
	});

	beforeUpdate(() => {
		autoscroll = div && div.offsetHeight + div.scrollTop > div.scrollHeight - 20;
	});

	afterUpdate(() => {
		if (autoscroll) div.scrollTo(0, div.scrollHeight);

		if (chatID) {
			if (boxElement) observer.unobserve(boxElement);
			boxElement = document.getElementById(chatID);
		}

		if (boxElement) observer.observe(boxElement);
	});
</script>

{#if $options.chat}
	<EditChat handle={emitDelete}>
		<h2 class="title">Are you sure you want delete this message?</h2>
	</EditChat>
{/if}

{#if $options.image}
	<div class="image">
		<button on:click={() => options.resetOptions()}>
			<i class="fa-solid fa-xmark"></i>
		</button>
		<img src={img} alt={alt}>
	</div>
{/if}

<div class="chats" bind:this={div}>
	{#each visibleChats as chat (chat._id)}
		<div
			id={chat._id}
			class='chat'
			class:me={$user.id === chat.from}
			on:dblclick={() => handleDelete(chat._id, chat.from)}
			role='none'
		>
			{#if chat.username}
				<h3>{chat.username}</h3>
			{/if}
			{#if (chat.content instanceof Array)}
				{#each chat.content as image (image)}
					<img
						src={DIR + '/uploads/' + image}
						alt={chat._id}
						on:click={handleImage}
						role='none'
					>
				{/each}
			{:else if validator.isURL(chat.content)}
				<a href='{chat.content}' target="_blank">{chat.content}</a>
			{:else}
				<p>{@html chat.content}</p>
			{/if}
			<p class="left">{getDate(chat.createdAt)}</p>
		</div>
	{/each}
</div>
<div class="message">
	<form class="text" on:submit|preventDefault={sendMessage}>
		<input type="text" name='message' bind:this={input}>
	</form>
	<label>
		<i class="fa-solid fa-images"></i>
		<input type="file" on:change|preventDefault={sendImage} multiple>
	</label>
</div>

<style lang="postcss">
  .image {
    grid-column: 2 / span 1;
    grid-row: 2 / span 1;
    background-color: #000000;
    z-index: 100;
    @apply grid content-center justify-center w-full h-full;
  }

	.image button {
		margin-top: 10px;
    background-color: transparent;
		@apply justify-self-end flex fixed items-center justify-center w-9 h-9 mt-2.5 mr-2.5 font-bold leading-none;
	}

	.image button i {
		color: #ffffff;
		@apply text-4xl font-bold leading-none cursor-pointer;
	}

  .image img {
    max-height: 770px;
    @apply w-full;
  }

  .message, .chats {
		grid-column: 2 / span 1;
		@apply w-full;
	}

  .chats {
		grid-row: 2 / span 1;
		background-image: url('/smiley.jpg');
		scrollbar-width: none;
		@apply flex flex-wrap p-4 bg-no-repeat bg-cover overflow-y-auto gap-y-3;
	}

	.chat {
		max-width: 60%;
		min-width: 260px;
		background-color: #ffffff;
		box-shadow: 0 0 0 1px #999999;
		@apply flex flex-wrap justify-around w-fit p-2 rounded gap-y-1 select-none;
	}

	.chat img {
		@apply w-60 h-60 object-cover object-top cursor-pointer;
	}

	.chat h3, .chat p, .chat a {
		@apply w-full overflow-hidden leading-tight break-words;
	}

	.chat a {
		color: #346eb1;
		@apply w-min mr-auto;
	}

	.chat a:hover {
		color: #7b24a3;
	}

	.me {
		@apply ml-auto;
	}

	.left {
		@apply text-right;
	}

	.message {
		grid-row: 3 / span 1;
		background-color: #e7e7e7;
		@apply flex p-2.5 gap-2.5;
	}

	.message .text {
		@apply w-full;
	}

	.message input {
		box-shadow: 0 0 0 1px #777777;
		@apply w-full p-2.5 rounded-lg;
	}

	.message label {
		min-width: 40px;
		min-height: 40px;
		background-color: #ffffff;
		box-shadow: 0 0 0 1px #777777;
		@apply flex justify-center items-center w-10 h-10 rounded-full cursor-pointer;
	}
</style>
