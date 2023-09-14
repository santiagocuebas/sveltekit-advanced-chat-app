<script lang="ts">
  import type { IContact, Contacts as IContacts, IList, ResponseData } from '$lib/types/global';
  import { onDestroy, onMount } from 'svelte';
  import axios from 'axios';
  import { DIR } from '$lib/config';
  import { selectJoin } from '$lib/dictionary';
	import { ButtonValue, TypeContact } from '$lib/types/enums';
	import { socket } from '$lib/socket';
  import { contact, switchs, users, groups, list, options } from '$lib/store';
  import Button from './Button.svelte';
  import Contacts from './Contact.svelte';

	export let id: string;
	
	let input = '';
	let usersValues: IContact[];
	let groupsValues: IContact[];
	let listValues: IList[];
	let selected: string;

	const unsubUsers = users.subscribe(value => usersValues = value as IContact[]);
	const unsubGroups = groups.subscribe(value => groupsValues = value as IContact[]);
	const unsubList = list.subscribe(value => listValues = value as IList[]);

	async function searchUser() {
		const data: ResponseData = await axios({
			method: 'GET',
			url: DIR + '/api/home/search/' + input,
			withCredentials: true
		}).then(res => res.data)
			.catch(err => err);

		if (data.contacts) {
			list.setContacts(data.contacts);
			switchs.setOption('search');
		}

		switchs.resetOptions();
	}

	const joinRoom = (foreign: IContact) => {
		id = foreign.contactID;
		options.resetOptions();
		contact.setContact(foreign);
		switchs.setOption('chat');
		socket.emit(selectJoin[foreign.type], foreign.contactID, foreign.roomID);
	};

	export const loadContacts = ([contactsUsers, contactsGroups]: IContacts) => {
		users.setContacts(contactsUsers);
		groups.setContacts(contactsGroups);

		if (contactsUsers.length > 0) selected = ButtonValue.CHATS;
		else if (contactsGroups.length > 0) selected = ButtonValue.ROOMS
		else selected = ButtonValue.CHATS;
	};

	const updateContacts = (contact: IContact, emit: boolean) => {
		if (contact.type === TypeContact.GROUP) {
			selected = ButtonValue.ROOMS;
			groups.setContacts([...groupsValues, contact]);
		} else {
			selected = ButtonValue.CHATS;
			users.setContacts([...usersValues, contact]); 
		}

		const actList = listValues.filter(user => user.id !== contact.contactID);
		list.setContacts(actList);
		
		if (emit) socket.emit('joinUpdate', contact);
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
			unsubList
		}
	})
</script>

<div class="sidebar">
	<form on:submit|preventDefault={searchUser}>
		<button>
			<i class="fa-solid fa-search"></i>
		</button>
		<input type="text" placeholder="Search a chat" bind:value={input}>
	</form>
	<Button bind:selected={selected} text={ButtonValue.CHATS} />
	<Button bind:selected={selected} text={ButtonValue.ROOMS} />
	<ul>
		{#if selected === ButtonValue.CHATS}
			{#if usersValues.length > 0}
				{#each usersValues as user (user.contactID)}
					<Contacts contact={user} id={id} join={joinRoom} /> 
				{/each}
				{:else}
				<div>No contacts yet</div>
			{/if}
			{:else if selected === ButtonValue.ROOMS}
			{#if groupsValues.length > 0}
				{#each groupsValues as group (group.roomID)}
					<Contacts contact={group} id={id} join={joinRoom}/>
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
		background-color: #ffffff;
		@apply flex flex-wrap content-start h-full overflow-hidden;
	}

  form {
		@apply flex w-full h-min;
	}

	button {
		padding: 15px 30px;
		cursor: pointer;
	}

	input {
		@apply w-full;
	}

	i {
		color: #666666;
		@apply text-xl leading-none;
	}

	ul {
		max-height: 720px;
		scrollbar-color: #bbbbbb transparent;
		scrollbar-width: thin;
		@apply flex flex-wrap w-full overflow-auto;
	}

	img {
    animation: spin 4s linear infinite;
		@apply w-8 h-8 rounded-full;
	}

	.sidebar div {
		color: #666666;
		@apply flex items-center justify-center w-full p-2.5 text-center text-2xl font-semibold leading-tight break-words;
	}

	.sidebar .loading {
		@apply flex gap-x-1;
	}

	@keyframes spin { 
		100% {
			transform: rotate(360deg); 
		}
	}
</style>
