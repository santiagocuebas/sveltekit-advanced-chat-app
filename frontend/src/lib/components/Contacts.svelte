<script lang="ts">
  import type { Contact, Contacts } from '$lib/types/global';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { Contact as Box } from './index';
  import { selectJoin } from '$lib/dictionary';
	import { socket } from '$lib/socket';
  import { contacts, contact as user } from '$lib/store';
	import { Option } from '$lib/types/enums';
	
	let selected: string;

	export const loadContacts = (lists: Contacts) => {
		const pathname = location.pathname;

		if (pathname.includes('/users') || pathname.includes('/groups')) {
			const [id, name] = pathname.split('/').reverse();
			const contact = lists[name]?.find(contact => contact.contactID === id);

			if (contact) {
				user.setContact(contact as Contact);
				socket.emit(selectJoin[name], contact.contactID, contact.roomID);
			} else goto('/');
		}

		contacts.setContacts(lists);

		if (lists.users.length) selected = Option.CHATS;
		else if (lists.groups.length) selected = Option.ROOMS
		else selected = Option.CHATS;
	};

	onMount(() => {
		socket.on('loadContacts', loadContacts);

		return () => socket.off('loadContacts', loadContacts);
	});
</script>

<div class="sidebar">
	<form action="/search">
		<button class="search">
			<i class="fa-solid fa-search"></i>
		</button>
		<input type="search" name="q" placeholder="Search a contact">
	</form>
	<button
		class='button'
		class:selected={selected === Option.CHATS}
		on:click={() => selected = Option.CHATS}
	><i class='fa-solid fa-message'></i></button>
	<button
		class='button'
		class:selected={selected === Option.ROOMS}
		on:click={() => selected = Option.ROOMS}
	><i class='fa-solid fa-users'></i></button>
	<ul>
		{#if selected === Option.CHATS}
			{#if $contacts.users.length > 0}
				{#each $contacts.users as contact (contact.contactID)}
					<Box {contact} /> 
				{/each}
			{:else}
				<div>No contacts yet</div>
			{/if}
		{:else if selected === Option.ROOMS}
			{#if $contacts.groups.length > 0}
				{#each $contacts.groups as contact (contact.roomID)}
					<Box {contact} />
				{/each}
			{:else}
				<div>Hasn't joined any groups yet</div>
			{/if}
		{:else}
			<div class="loading">
				<img src="/loading.png" alt="images">
				Loading
			</div>
		{/if}
	</ul>
</div>

<style lang="postcss">
	.sidebar {
		grid-row: 2 / span 2;
		@apply flex flex-wrap content-start w-full h-full bg-white overflow-hidden;
	}

  form {
		@apply flex w-full h-min [&_button]:py-[15px] [&_button]:px-[30px];

		& input {
			@apply w-full outline-none;
		}

		& i {
			@apply text-xl leading-none text-[#666666];
		}
	}

	.button {
		border: 3px solid #888888;
		@apply flex relative items-center justify-center w-1/2 h-[70px] font-bold text-[#777777] gap-2;

		& i {
			@apply flex items-center justify-center text-2xl leading-none;
		}

		&.selected {
			border: 3px solid #3d7cf1;
			@apply text-[#3d7cf1];
		}
  }

	ul {
		scrollbar-color: #bbbbbb transparent;
		scrollbar-width: thin;
		@apply flex flex-col w-full h-[calc(100%-120px)] overflow-auto;

		& div {
			@apply flex items-center justify-center w-full p-2.5 text-center text-[24px] font-semibold text-[#666666] leading-tight break-words [&.loading]:gap-x-1;
		}

		& img {
			animation: spin 4s linear infinite;
			@apply w-8 h-8 rounded-full;
		}
	}

	@keyframes spin { 
		100% {
			transform: rotate(360deg); 
		}
	}
</style>
