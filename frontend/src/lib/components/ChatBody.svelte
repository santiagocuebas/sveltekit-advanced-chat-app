<script lang="ts">
  import type { IChat } from "$lib/types/global";
  import { afterUpdate, beforeUpdate, onMount } from "svelte";
	import validator from 'validator';
  import { DIR } from "$lib/config";
  import { getDate, isAudio, isVideo } from "$lib/services";
  import { socket } from "$lib/socket";
  import { user, options } from "$lib/store";
  import { Option } from "$lib/types/enums";

  export let id: string;
	export let visibleChats: IChat[];

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
	let img: string;
	let alt: string;

	function handleImage(this: HTMLImageElement) {
		img = this.src;
		alt = this.alt;
		options.setOption(Option.IMAGE);
	}

	function handleDelete(chatID: string, from: string) {
		if ($user.id === from) {
			id = chatID;
			options.setOption(Option.CHAT);
		}
	}

	function showMoreChats([entry]: IntersectionObserverEntry[]) {
		if (entry?.isIntersecting) showChats(counter+50);
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
		showChats(50);
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

<div class="container-chats">
	<div class="box-chats" bind:this={div}>
		{#each visibleChats as { _id, content, createdAt, from, username } (_id)}
			<div
				class="chat"
				class:me={$user.id === from}
				role='none'
				on:dblclick={() => handleDelete(_id, from)}
			>
				{#if username}
					<h3>
						{username}
					</h3>
				{/if}
				{#if (content instanceof Array)}
					{#if content.length > 1}
						<div>
							{#each content as image (image)}
								<picture>
									<img
										src={DIR + '/' + image}
										alt={_id}
										role='none'
										on:click={handleImage}
									>
								</picture>
							{/each}
						</div>
					{:else}
						{#if isVideo(content[0])}
							<video controls src={DIR + '/' + content[0]}>
								<track kind="captions"/>
							</video>
						{:else if isAudio(content[0])}
							<audio controls src={DIR + '/' + content[0]}></audio>
						{:else}
							<picture>
								<img
									src={DIR + '/' + content[0]}
									alt={_id}
									role='none'
									on:click={handleImage}
								>
							</picture>
						{/if}
					{/if}
				{:else if validator.isURL(content)}
					<a href='{content}' target="_blank">
						{content}
					</a>
				{:else}
					<p>
						{@html content}
					</p>
				{/if}
				<p class="left">
					{getDate(createdAt)}
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
		@apply flex flex-col w-full bg-no-repeat bg-cover overflow-hidden;
	}

  .box-chats {
		container-type: inline-size;
		scrollbar-width: none;
		@apply flex flex-col w-[100%-16px] h-[100%-16px] m-2 p-2 overflow-y-auto gap-y-3;
	}

	.chat {
		box-shadow: 0 0 2px #888888;
		@apply flex flex-col justify-around w-fit min-w-[252px] max-w-[60%] p-1.5 bg-white rounded-sm gap-y-0.5 select-none [&.me]:ml-auto [&_h3]:font-semibold;

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
				@apply w-full h-full object-cover object-top cursor-pointer;
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
