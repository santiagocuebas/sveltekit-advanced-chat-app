<script lang="ts">
  import type { PageServerData } from "./$types";
	import { beforeNavigate } from "$app/navigation";
	import {
		ChatBody,
		ChatFooter,
		ChatHeader,
		ChatOptions,
		LoadingBox
	} from '$lib/components';
	import { contact } from "$lib/store";

	export let data: PageServerData;

	let option = '';
	
	beforeNavigate(() => data.chats = null);
</script>

{#if $contact?.contactID && data.chats}
	<ChatHeader bind:option={option} />
	<ChatOptions bind:option={option} />
	<ChatBody bind:chats={data.chats} />
	<ChatFooter bind:chats={data.chats} />
{:else}
	<LoadingBox className={'box-loading'} />
{/if}
