<script lang="ts">
  import type { IKeys } from '$lib/types/global';
	import { onMount } from 'svelte';
	import { socket } from '$lib/socket.js';
  import { switchs } from '$lib/store';
  import UserHeader from '$lib/components/UserHeader.svelte';
  import Contacts from '$lib/components/Contacts.svelte';
  import ChatUser from '$lib/components/ChatUser.svelte';
  import Chat from "$lib/components/Chats.svelte";
  import Search from '$lib/components/Search.svelte';
  import Group from '$lib/components/Group.svelte';
  import Settings from '$lib/components/Settings.svelte';
	
	let errorMessage: IKeys<string> | null = null;

	const socketError = (err: IKeys<string>) => {
		errorMessage = err;
		setTimeout(() => errorMessage = null, 5000);
	};

	onMount(() => {
		socket.on('socketError', socketError);

		return () => socket.off('socketError', socketError);
	});
</script>

<UserHeader />
<Contacts />
{#if $switchs.chat}
	<ChatUser />
	<Chat />
{:else if $switchs.search}
	<Search />
{:else if $switchs.group}
	<Group />
{:else if $switchs.settings}
	<Settings />
{:else}
	<div class='box-chat'>
		<img src="/smiley-main.jpg" alt="smiley placeholder">
		<h2>Welcome!</h2>
	</div>
{/if}
{#if errorMessage}
	<div class="error">
		<h3>{errorMessage?.error}</h3>
		<p>{errorMessage?.message}</p>
	</div>
{/if}

<style lang="postcss">
	.box-chat {
		grid-column: 2 / span 1;
		grid-row: 1 / span 3;
		background-color: #f0f3f3;
		z-index: 50;
		@apply flex flex-wrap relative justify-center w-full h-full overflow-hidden;
	}

	.box-chat img {
		min-width: 295px;
		min-height: 295px;
		max-width: 480px;
		max-height: 480px;
		@apply self-end w-1/2 rounded-full;
	}

	.box-chat h2 {
		@apply w-full min-h-min text-center text-6xl leading-none;
	}

	.error {
		grid-column: 2 / span 1;
		grid-row: 2 / span 1;
		width: 200px;
		border: 2px solid #9c1313;
		background-color: #f1b1b1;
		z-index: 400;
		@apply grid absolute justify-items-center self-end justify-self-center m-1 p-2.5 rounded-2xl gap-1;
	}

	.error h3 {
		@apply w-full overflow-hidden break-words text-center text-2xl leading-none;
	}

	.error p {
		@apply w-full overflow-hidden break-words text-center text-xl leading-tight;
	}
</style>
