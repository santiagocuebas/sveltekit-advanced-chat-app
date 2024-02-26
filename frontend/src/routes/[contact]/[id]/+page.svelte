<script lang="ts">
	import type { IChat, IGroupProps } from "$lib/types/global";
  import { onMount } from "svelte";
	import {
		ChatBody,
		ChatFooter,
		ChatHeader,
		ChatOptions,
		EditChat
	} from '$lib/components';
	import { socket } from "$lib/socket";
	import { contact, options } from "$lib/store";
  import { Option } from "$lib/types/enums";

	let id = '';
	let option = '';
	let visibleChats: IChat[] = [];
	let img: string;
	let alt: string;
	let groupProps: IGroupProps;

	function emitDelete() {
		socket.emit('emitDelete', id);
		deleteChat(id);
		options.resetOptions();
	}

	function handleImage(this: HTMLImageElement) {
		img = this.src;
		alt = this.alt;
		options.setOption(Option.IMAGE);
	}

	function loadChat(message: IChat, roomID: string) {
		if (roomID === $contact.roomID) visibleChats = [...visibleChats, message];
	};

	function deleteChat(id: string)  {
		visibleChats = visibleChats.filter(({ _id }) => _id !== id);
	};
	
  onMount(() => {
		socket.on('loadChat', loadChat);
		socket.on('deleteChat', deleteChat);

		return () => {
			socket.off('loadChat', loadChat);
			socket.off('deleteChat', deleteChat);
		};
	});
</script>

{#if $options.chat}
	<EditChat handle={emitDelete}>
		<h2 class="title">
			Are you sure you want delete this message?
		</h2>
	</EditChat>
{/if}

{#if $options.image}
	<div class="box-image">
		<button on:click={() => options.resetOptions()}>
			<i class="fa-solid fa-xmark"></i>
		</button>
		<img src={img} alt={alt}>
	</div>
{/if}

{#if $contact.contactID}
	<ChatHeader bind:option={option} bind:groupProps={groupProps} />
	<ChatOptions bind:option={option} bind:groupProps={groupProps} />
	<ChatBody bind:id={id} bind:visibleChats={visibleChats} {handleImage} />
	<ChatFooter {loadChat} />
	{:else}
	<div class="box-loading">
		<picture>
			<img src="/images.svg" alt="title">
		</picture>
		<h1>
			Loading
		</h1>
	</div>
{/if}

<style lang="postcss">
	.box-image {
		grid-column: 2 / span 1;
		grid-row: 2 / span 1;
		@apply grid content-center justify-center w-full h-full bg-black z-[100] [&_img]:w-full [&_img]:max-h-[750px];

		& button {
			@apply justify-self-end flex fixed items-center justify-center w-9 h-9 mt-2.5 mr-2.5 bg-transparent font-bold leading-none;

			& i {
				@apply text-[36px] font-bold text-white;
			}
		}
	}

	.box-loading {
		grid-column: 2 / span 1;
		grid-row: 1 / span 3;
		@apply flex flex-col items-center justify-center w-full h-full bg-white gap-2 [&_h1]:text-[56px];
		
		& picture {
			@apply flex-none w-[250px] h-[250px];
		}

		& img {
			animation: spin 4s linear infinite;
			@apply w-full h-full rounded-full;
		}
	}

	@keyframes spin { 
    100% { 
      transform: rotate(360deg); 
  	}
	}
</style>
