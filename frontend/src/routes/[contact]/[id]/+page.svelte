<script lang="ts">
	import type { IChat } from "$lib/types/global";
  import { onMount } from "svelte";
	import {
		ChatBody,
		ChatFooter,
		ChatHeader,
		ChatOptions,
		EditChat,
    LoadingBox
	} from '$lib/components';
	import { socket } from "$lib/socket";
	import { contact, options } from "$lib/store";
  import { Option } from "$lib/types/enums";

	let id = '';
	let option = '';
	let visibleChats: IChat[] = [];
	let img: string;
	let alt: string;

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
	}

	function deleteChat(id: string) {
		visibleChats = visibleChats.filter(({ _id }) => _id !== id);
	}
	
  onMount(() => {
		socket.on('loadChat', loadChat);
		socket.on('deleteChat', deleteChat);

		return () => {
			socket.off('loadChat', loadChat);
			socket.off('deleteChat', deleteChat);
		}
	});
</script>

{#if $options.chat}
	<EditChat on:click={emitDelete}>
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
	<ChatHeader bind:option={option} />
	<ChatOptions bind:option={option} />
	<ChatBody bind:id={id} bind:visibleChats={visibleChats} {handleImage} />
	<ChatFooter {loadChat} />
{:else}
	<LoadingBox className={'box-loading'} />
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
</style>
