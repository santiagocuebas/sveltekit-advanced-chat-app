<script lang="ts">
  import type { PageServerData } from "./$types";
	import { afterNavigate, beforeNavigate } from "$app/navigation";
	import {
		ChatBody,
		ChatFooter,
		ChatHeader,
		ChatOptions,
		LoadingBox
	} from '$lib/components';
	import { selectJoin } from "$lib/dictionary";
	import { socket } from "$lib/socket";
	import { contact } from "$lib/store";

	export let data: PageServerData;

	let option = '';
	
	beforeNavigate(() => data.chats = null);

	afterNavigate(() => {
		if ($contact?.contactID) {
			socket.emit(selectJoin[$contact.type], $contact.contactID, $contact.roomID);
		}
	}); 
</script>

{#if $contact?.contactID && data.chats}
	<ChatHeader bind:option={option} />
	<ChatOptions bind:option={option} />
	<ChatBody bind:chats={data.chats} />
	<ChatFooter bind:chats={data.chats} />
{:else}
	<LoadingBox className={'box-loading'} />
{/if}
