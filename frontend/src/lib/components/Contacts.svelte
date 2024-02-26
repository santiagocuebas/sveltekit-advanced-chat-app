<script lang="ts">
  import type {
		IForeign,
		IGroup,
		IList,
		Contact,
		Contacts,
		ResponseData
	} from '$lib/types/global';
  import { goto } from '$app/navigation';
  import { onDestroy, onMount } from 'svelte';
  import { Contact as Box } from './index';
  import axios from '$lib/axios';
  import { selectJoin } from '$lib/dictionary';
	import { socket } from '$lib/socket';
  import { users, groups, list, contact as user } from '$lib/store';
	import { Option } from '$lib/types/enums';
	
	let input = '';
	let usersValues: IForeign[];
	let groupsValues: IGroup[];
	let listValues: IList[];
	let selected: string;

	const unsubUsers = users.subscribe(value => usersValues = value as IForeign[]);
	const unsubGroups = groups.subscribe(value => groupsValues = value as IGroup[]);
	const unsubLists = list.subscribe(value => listValues = value as IList[]);

	async function searchUser() {
		const data: ResponseData = await axios({ url: '/home/search/' + input })
			.then(res => res.data)
			.catch(err => err.response?.data);

		if (data.contacts) list.setLists(data.contacts);
		input = '';
	}

	export const loadContacts = (contacts: Contacts) => {
		const pathname = location.pathname;

		if (pathname.includes('/users') || pathname.includes('/groups')) {
			const [id, name] = pathname.split('/').reverse();
			const contact = contacts[name]?.find(contact => contact.contactID === id);

			if (contact) {
				user.setContact(contact as Contact);
				socket.emit(selectJoin[name], contact.contactID, contact.roomID);
			} else goto('/');
		}

		users.setUsers(contacts.users);
		groups.setGroups(contacts.groups);

		if (contacts.users.length) selected = Option.CHATS;
		else if (contacts.groups.length) selected = Option.ROOMS
		else selected = Option.CHATS;
	};

	const updateContacts = (user: Contact, emit: boolean) => {
		if (user.type === Option.USER) users.setUsers([...usersValues, user]);
		else groups.setGroups([...groupsValues, user]);

		const actList = listValues.filter(item => item.contactID !== user.contactID);
		list.setLists(actList);
		
		if (emit) socket.emit('joinUpdate', user);
	};

	onMount(() => {
		socket.on('loadContacts', loadContacts);
		socket.on('updateContacts', updateContacts);

		return () => {
			socket.off('loadContacts', loadContacts);
			socket.off('updateContacts', updateContacts);
		}
	});

	onDestroy(() => {
		return {
			unsubUsers,
			unsubGroups,
			unsubLists
		}
	})
</script>

<div class="sidebar">
	<form action="/search" on:submit={searchUser}>
		<button class="search">
			<i class="fa-solid fa-search"></i>
		</button>
		<input type="search" name="q" placeholder="Search a contact" bind:value={input}>
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
			{#if usersValues.length > 0}
				{#each usersValues as user (user.contactID)}
					<Box contact={user} /> 
				{/each}
			{:else}
				<div>No contacts yet</div>
			{/if}
		{:else if selected === Option.ROOMS}
			{#if groupsValues.length > 0}
				{#each groupsValues as group (group.roomID)}
					<Box contact={group} />
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
		@apply flex flex-wrap content-start h-full bg-white overflow-hidden;
	}

  form {
		@apply flex w-full h-min [&_button]:py-[15px] [&_button]:px-[30px];

		& input {
			outline: none;
			@apply w-full;
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
		@apply flex flex-col w-full max-h-[720px] overflow-auto;

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
