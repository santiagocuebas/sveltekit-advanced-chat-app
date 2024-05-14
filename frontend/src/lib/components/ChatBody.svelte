<script lang="ts">
	import type { IChat } from "$lib/types/global";
	import { afterUpdate, onMount } from "svelte";
	import validator from 'validator';
	import { EditChat } from "./index";
	import axios from "$lib/axios";
  import { DIR } from "$lib/config";
	import { selectJoin } from "$lib/dictionary";
	import { getDate, isAudio, isVideo } from "$lib/services";
	import { socket } from "$lib/socket";
	import { user, options, contact, contacts } from "$lib/store";
	import { Option } from "$lib/types/enums";

	export let chats: IChat[];

	const observerOptions = { root: null, rootMargin: '0px' };
	const	observer = new IntersectionObserver(showMoreChats, observerOptions);
	let chat: IChat | null = null;
	let boxElement: HTMLElement | null = null;
	let chatID = !(chats.length < 50) ? chats.at(-1)?._id : undefined;
	let img: string;
	let alt: string;

	function showMoreChats([entry]: IntersectionObserverEntry[]) {
		if (entry?.isIntersecting) showChats();
	}

	function emitDelete() {
		socket.emit('emitDelete', chat?._id);
		if (chat) deleteChat(chat);
		options.resetOptions();
	}

	function handleImage(this: HTMLImageElement) {
		img = this.src;
		alt = this.alt;
		options.setOption(Option.IMAGE);
	}

	function handleDelete(selecedChat: IChat) {
		if ($user.id === selecedChat.from) {
			chat = selecedChat;
			options.setOption(Option.CHAT);
		}
	}

	const showChats = async () => {
		const chatsLength = chats.length;
		const type = location.pathname.includes(Option.USERS)
			? Option.USERS
			: Option.GROUPS;

		const loadChats = await axios({
			url: `/home/chats?id=${$contact?.contactID}&skip=${chatsLength}&type=${type}`
		}).then(res => res.data)
			.catch(() => {
				console.error('Network or Logged Error');
				return [];
			});

		for (const chat of loadChats) {
			chats = [...chats, chat];
		}

		chatID = !(chats.length < chatsLength + 50) ? chats.at(-1)?._id : undefined;
	};
	
	const loadChatID = (id: string, tempID: string) => {
		chats = chats.map(chat => {
			if (chat._id === tempID) chat._id = id;
			return chat;
		});
	};

	const deleteChat = (chat: IChat) => {
		chats = chats.filter(visibleChat => visibleChat._id !== chat._id);
		const foundChat = chats.find(visibleChat => visibleChat.to === chat.to);

		if (foundChat) return foundChat.type === Option.GROUP
			? contacts.editGroups(foundChat)
			: contacts.editUsers(foundChat);

		chat.type === Option.GROUP 
			? contacts.editGroups({ ...chat, content: undefined, createdAt: undefined })
			: contacts.editUsers({ ...chat, content: undefined, createdAt: undefined });
	}

	onMount(() => {
		if ($contact) {
			socket.emit(selectJoin[$contact.type], $contact.contactID, $contact.roomID);
		}

		socket.on('loadChatID', loadChatID);
		socket.on('deleteChat', deleteChat);

		return () => {
			socket.off('loadChatID', loadChatID);
			socket.off('deleteChat', deleteChat);
		};
	});

	afterUpdate(() => {
		if (chatID) {
			boxElement = document.getElementById(chatID);
			if (boxElement) observer.observe(boxElement);
		}
	});
</script>

{#if $options.image}
	<div class="box-image">
		<button on:click={() => options.resetOptions()}>
			<i class="fa-solid fa-xmark"></i>
		</button>
		<picture>
			<img src={img} alt={alt}>
		</picture>
	</div>
{/if}

{#if $options.chat}
	<EditChat on:click={emitDelete}>
		<h2 class="title">
			Are you sure you want delete this message?
		</h2>
	</EditChat>
{/if}

<div class="container-chats">
	<div class="box-chats">
		{#each chats as chat (chat._id)}
			<div
				id={chat._id}
				class="chat"
				class:me={$user.id === chat.from}
				role='none'
				on:dblclick={() => handleDelete(chat)}
			>
				{#if chat.username}
					<h3>
						{chat.username}
					</h3>
				{/if}
				{#if (chat.content instanceof Array)}
					{#if chat.content.length > 1}
						<div>
							{#each chat.content as image (image)}
								<picture>
									<img
										src={DIR + '/' + image}
										alt={chat._id}
										role='none'
										on:click={handleImage}
									>
								</picture>
							{/each}
						</div>
					{:else}
						{#if isVideo(chat.content[0])}
							<video controls src={DIR + '/' + chat.content[0]}>
								<track kind="captions"/>
							</video>
						{:else if isAudio(chat.content[0])}
							<audio controls src={DIR + '/' + chat.content[0]}></audio>
						{:else}
							<picture>
								<img
									src={DIR + '/' + chat.content[0]}
									alt={chat._id}
									role='none'
									on:click={handleImage}
								>
							</picture>
						{/if}
					{/if}
				{:else if validator.isURL(chat.content ?? '')}
					<a href='{chat.content}' target="_blank">
						{chat.content}
					</a>
				{:else}
					<p>
						{@html chat.content}
					</p>
				{/if}
				<p class="left">
					{getDate(chat.createdAt ?? '')}
				</p>
			</div>
		{/each}
	</div>
</div>

<style lang="postcss">
	.box-image {
		grid-column: 2 / span 1;
		grid-row: 2 / span 2;
		@apply flex relative items-center justify-center w-full h-full bg-black z-[200];

		& picture {
			@apply w-full h-full;

			& img {
				@apply w-full h-full object-scale-down;
			}
		}

		& button {
			@apply flex absolute items-center justify-center w-9 h-9 top-5 right-5  bg-transparent font-bold leading-none;

			& i {
				@apply text-[36px] font-bold text-white;
			}
		}
	}

	.container-chats {
		grid-column: 2 / span 1;
		grid-row: 2 / span 1;
		background-image: url('/smiley.jpg');
		@apply flex bg-no-repeat bg-cover overflow-hidden;
	}

	.box-chats {
		container-type: inline-size;
		scrollbar-width: none;
		@apply flex flex-col-reverse w-full h-min max-h-[calc(100%-16px)] my-2 mx-[2.68%] p-2 overflow-y-auto gap-y-3;
	}

	.chat {
		box-shadow: 0 0 2px #888888;
		@apply flex flex-col content-end w-fit min-w-[252px] max-w-[60%] h-max p-1.5 bg-white rounded-sm gap-y-0.5 select-none [&.me]:ml-auto [&_h3]:font-semibold;

		& div {
			@apply flex flex-wrap items-start justify-start w-[480px];

			& picture {
				@apply flex-none w-60 h-60;
			}

			@container (width < 820px) {
				@apply w-60;
			}
		}

		& picture {
			@apply flex min-w-60 max-w-[360px];

			& img {
				@apply flex w-full h-full object-cover object-top cursor-pointer;
			}
		}

		& h3, p, a {
			@apply w-full overflow-hidden leading-tight break-words;
		}

		& p {
			@apply px-1 [&.left]:text-right;
		}

		a {
			@apply w-min mr-auto text-[#346eb1] hover:text-[#7b24a3];
		}
	}
</style>
