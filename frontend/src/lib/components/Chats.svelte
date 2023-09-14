<script lang="ts">
  import type { IChat, ResponseData } from "$lib/types/global";
  import { afterUpdate, beforeUpdate, onMount } from "svelte";
  import axios from "axios";
	import validator from 'validator';
	import { DIR } from "$lib/config";
  import { Formats, TypeContact } from "$lib/types/enums";
	import { socket } from "$lib/socket";
  import { getDate } from "$lib/services/libs";
  import { getChat } from "$lib/services/chat-libs";
  import { editGroups } from '$lib/sockets.js';
  import { contact, user, options } from "$lib/store";
  import EditChat from "./EditChat.svelte";

  export let option: string;
  export let chat: boolean;
  export let handle: () => void;

	const	observer = new IntersectionObserver(showMoreChats, {
		root: null,
		rootMargin: '0px',
	});
	let div: HTMLElement;
	let autoscroll: boolean;
	let boxElement: HTMLElement | null;
	let chatID = '';
	let input: HTMLInputElement;
	let counter = 0;
	let chats: IChat[] = [];
	let visibleChats: IChat[] = [];
	let message = '';

	function sendMessage(this: HTMLFormElement) {
		const message = new FormData(this).get('message') as string;

		if (message.length) {
			const chat = getChat($user, $contact, message);

			loadChat(chat);

			socket.emit('emitChat', message, chat._id);

			if ($contact.type === TypeContact.GROUP) editGroups($contact.roomID, chat);
		}

		input.value = '';
	}

	async function sendImage(this: HTMLInputElement) {
		if (this.files && this.files.length < 4) {
			const formData = new FormData();
			const validFormat: string[] = Object.values(Formats);
			let match = true;

			for (const file of this.files) {
				if (file.size > 1e7 * 2 && !validFormat.includes(file.type)) {
					match = false;
					break;
				}

				formData.append('images', file);
			}

			if (match) {
				const data: ResponseData = await axios({
					method: 'POST',
					url: DIR + '/api/home/images',
					data: formData,
					withCredentials: true
				}).then(res => res.data)
					.catch(err => err);

				if (data && data.filenames) {
					const chat = getChat($user, $contact, data.filenames);

					loadChat(chat);

					socket.emit('emitChat', data.filenames, chat._id);

					if ($contact.type === TypeContact.GROUP) {
						editGroups($contact.roomID, chat);
					}

					message = '';
				}
			}

			formData.delete('images');
		}
	}

	function handleDelete(id: string, from: string) {
		if ($user.id === from) {
			option = id;
			options.setOption('chat');
		}
	}

	function emitDelete(id: string) {
		socket.emit('emitDelete', id);
		deleteChat(id);
		options.resetOptions();
	}

	function showMoreChats([entry]: IntersectionObserverEntry[]) {
		if (entry?.isIntersecting && chats.length > counter) return showChats(50);
	}

	function showChats(num: number) {
		for (let i = 0; i < num; i++) {
			if (chats[counter+i]) {
				visibleChats = [chats[counter+i], ...visibleChats];
				chatID = chats[counter+i]._id;
			} else {
				if (boxElement) observer.unobserve(boxElement);
				chatID = '';
				break;
			}
		}

		counter += num;
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

{#if chat}
	<EditChat bind:visible={chat} option={option} handle={emitDelete}>
		<h2 class="title">Are you sure you want delete this message?</h2>
	</EditChat>
{/if}

<div class="chats" bind:this={div}>
	{#each visibleChats as chat (chat._id)}
		<div
			id={chat._id}
			class='chat {$user.id === chat.from ? 'me' : ''}'
			on:dblclick={() => handleDelete(chat._id, chat.from)}
			role='none'
		>
			{#if chat.username}
				<p class="username">{chat.username}</p>
			{/if}
			{#if (chat.content instanceof Array)}
				{#each chat.content as image (image)}
					<img
						src={DIR + '/uploads/' + image}
						alt={chat._id}
						on:mousedown={handle}
						role='none'
					>
				{/each}
				{:else if validator.isURL(chat.content)}
				<a href='{chat.content}' target="_blank">{chat.content}</a>
				{:else}
				<p>{@html chat.content}</p>
			{/if}
			<p class="left">{getDate(new Date(chat.createdAt))}</p>
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
  .message, .chats {
		grid-column: 2 / span 1;
		@apply w-full;
	}

  .chats {
		grid-row: 2 / span 1;
		grid-auto-rows: min-content;
		background-image: url('/smiley.jpg');
		scrollbar-width: none;
		scrollbar-color: #6198d6 transparent;
		@apply grid p-5 bg-no-repeat bg-cover overflow-y-auto gap-y-3;
	}

	.chat {
		grid-template-columns: repeat(2, 1fr);
		grid-auto-rows: min-content;
		max-width: 60%;
		min-width: 200px;
		background-color: #ffffff;
		box-shadow: 0 0 0 1px #aaaaaa;
		@apply grid w-fit p-2.5 rounded-lg gap-x-1 gap-y-1 select-none;
	}

	.chat img {
		@apply w-full self-start object-cover object-top cursor-pointer;
	}

	.chat p {
		grid-column: 1 / span 2;
		@apply overflow-hidden leading-tight break-words;
	}

	.chat a {
		grid-column: 1 / span 2;
		color: #346eb1;
		@apply overflow-hidden leading-tight break-words;
	}

	.chat:hover a {
		color: #7b24a3;
	}

	.me {
		@apply ml-auto;
	}

	.left {
		@apply ml-auto;
	}

	.username {
		@apply font-semibold;
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
