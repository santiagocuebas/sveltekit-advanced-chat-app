<script lang="ts">
  import type { IKeys } from '$lib/types/global';
	import { onMount } from 'svelte';
	import { socket } from '$lib/socket.js';
  import { switchs } from '$lib/store';
  import UserHeader from '$lib/components/UserHeader.svelte';
  import Contacts from '$lib/components/Contacts.svelte';
  import ChatBox from '$lib/components/ChatBox.svelte';
  import ChatUser from '$lib/components/ChatUser.svelte';
  import Search from '$lib/components/Search.svelte';
  import Group from '$lib/components/Group.svelte';
  import Settings from '$lib/components/Settings.svelte';
  import ErrorMessage from '$lib/components/ErrorMessage.svelte';
	
	let contactID: string;
	let errorMessage: IKeys<string> | null = null;

	const socketError = (err: IKeys<string>) => errorMessage = err;

	onMount(() => {
		socket.on('socketError', socketError);

		return () => socket.off('socketError', socketError);
	});
</script>

<UserHeader bind:contactID={contactID} />
<Contacts bind:id={contactID} />
{#if $switchs.chat}
	<ChatUser />
	{:else if $switchs.search}
	<Search />
	{:else if $switchs.group}
	<Group />
	{:else if $switchs.settings}
	<Settings />
	{:else}
	<ChatBox />
{/if}
{#if errorMessage}
	<ErrorMessage bind:error={errorMessage} />
{/if}
