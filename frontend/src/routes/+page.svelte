<script lang="ts">
	import type { PageServerData } from './$types';
	import type { IUser } from '$lib/global';
	import { onMount } from 'svelte';
	import { socket } from '$lib/socket.js'
  import UserHeader from '$lib/components/UserHeader.svelte';
  import Contacts from '$lib/components/Contacts.svelte';
  import ChatBox from '$lib/components/ChatBox.svelte';
  import Chat from '$lib/components/Chat.svelte';

	export let data: PageServerData;

	let user: IUser = data.user;
	let contacts: IUser[] = [];
	let contact: IUser;

	const userContacts = (contact: IUser[]) => {
		contacts = contact;
		console.log(contact);
	};

	onMount(() => {
		socket.auth = { id: user._id };
		socket.connect();
	
		socket.on('loadContacts', userContacts);

		return () => {
			socket.off('loadContacts', userContacts);
		}
	});
</script>

<div class="container">
	<UserHeader user={user} />
	<Contacts contacts={contacts} bind:contact={contact} />
	<ChatBox user={contact}>
		<Chat user={contact}/>
	</ChatBox>
</div>

<style lang="postcss">
	.container {
		grid-template-columns: 555px 1fr;
		grid-auto-rows: min-content 1fr;
		box-shadow: 0 0 0 1px #6f6f6f;
		background-color: #999999;
		z-index: 25;
		@apply grid relative w-full h-full gap-x-px gap-y-px;
	}
</style>
