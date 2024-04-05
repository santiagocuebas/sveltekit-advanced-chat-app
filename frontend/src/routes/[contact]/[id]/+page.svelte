<script lang="ts">
	import type { IChat } from "$lib/types/global";
	import { afterNavigate, beforeNavigate } from "$app/navigation";
	import { onMount } from "svelte";
	import {
		ChatBody,
		ChatFooter,
		ChatHeader,
		ChatOptions,
		EditChat,
		LoadingBox
	} from '$lib/components';
	import { selectJoin } from "$lib/dictionary";
	import { socket } from "$lib/socket";
	import { contact, options } from "$lib/store";

	let id = '';
	let option = '';
	let visibleChats: IChat[] = [];

	function emitDelete() {
		socket.emit('emitDelete', id);
		deleteChat(id);
		options.resetOptions();
	}

	function loadChat(message: IChat, roomID: string) {
		if (roomID === $contact?.roomID) visibleChats = [...visibleChats, message];
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

	beforeNavigate(() => visibleChats = []);

	afterNavigate(() => {
		if ($contact?.contactID) {
			socket.emit(selectJoin[$contact.type], $contact.contactID, $contact.roomID);
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

{#if $contact}
	<ChatHeader bind:option={option} />
	<ChatOptions bind:option={option} />
	<ChatBody bind:id={id} bind:visibleChats={visibleChats} />
	<ChatFooter {loadChat} />
{:else}
	<LoadingBox className={'box-loading'} />
{/if}
