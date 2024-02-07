<script lang="ts">
  import type { IChat } from "$lib/types/global";
  import { afterUpdate, beforeUpdate, onMount } from "svelte";
	import validator from 'validator';
  import { EditChat } from "./index";
	import { DIR } from "$lib/config";
  import { Option } from "$lib/types/enums";
	import { socket } from "$lib/socket";
  import { getDate, getImages } from "$lib/services/libs";
  import { getChat } from "$lib/services/chat-libs";
  import { editGroups } from '$lib/sockets';
  import { contact, user, options } from "$lib/store";

	const	observer = new IntersectionObserver(showMoreChats, {
		root: null,
		rootMargin: '0px',
	});
  let id: string;
	let div: HTMLElement;
	let autoscroll: boolean;
	let boxElement: HTMLElement | null;
	let chatID: string | undefined;
	let input: HTMLInputElement;
	let counter = 0;
	let chats: IChat[] = [];
	let visibleChats: IChat[] = [];
	let img: string;
	let alt: string;

	function handleChat(data: string | string[]) {
		const chat = getChat($user, $contact, data);
		loadChat(chat, $contact.roomID);
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

	const loadChat = (message: IChat, roomID: string) => {
		if (roomID === $contact.roomID) visibleChats = [...visibleChats, message];
	};

	const deleteChat = (id: string) => {
		visibleChats = visibleChats.filter(({ _id }) => _id !== id);
	};

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
    @apply grid content-center justify-center w-full h-full bg-black z-[100] [&_img]:w-full [&_img]:max-h-[750px];

		& button {
			@apply justify-self-end flex fixed items-center justify-center w-9 h-9 mt-2.5 mr-2.5 bg-transparent font-bold leading-none;

			& i {
				@apply text-[36px] font-bold text-white cursor-pointer;
			}
		}
  }

  .chats {
		grid-column: 2 / span 1;
		grid-row: 2 / span 1;
		grid-auto-rows: min-content;
		background-image: url('/smiley.jpg');
		scrollbar-width: none;
		@apply grid w-full p-4 bg-no-repeat bg-cover overflow-y-auto gap-y-3;
	}

	.chat {
		box-shadow: 0 0 3px #777777;
		@apply flex flex-wrap justify-around w-fit min-w-[260px] max-w-[60%] p-2.5 bg-white rounded-lg gap-0.5 select-none [&.me]:ml-auto [&_.left]:text-right;

		& img {
			@apply w-60 h-60 object-cover object-top cursor-pointer;
		}

		& h3, p, a {
			@apply w-full overflow-hidden leading-tight break-words;
		}

		& a {
			@apply w-min mr-auto text-[#346eb1] hover:text-[#7b24a3];
		}
	}

	.message {
		grid-column: 2 / span 1;
		grid-row: 3 / span 1;
		@apply flex w-full p-2.5 bg-[#e7e7e7] gap-2.5 [&_form]:w-full;

		& input {
			box-shadow: 0 0 0 1px #777777;
			@apply w-full p-2.5 rounded-lg;
		}

		& label {
			background-color: #ffffff;
			box-shadow: 0 0 0 1px #777777;
			@apply flex flex-none justify-center items-center w-10 h-10 bg-white rounded-full cursor-pointer;
		}
	}
</style>
