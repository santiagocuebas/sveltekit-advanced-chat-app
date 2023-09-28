<script lang="ts">
  import type {
		IForeign,
		IGroup,
		IList,
		Contact,
		Contacts,
		ResponseData
	} from '$lib/types/global';
  import { onDestroy, onMount } from 'svelte';
  import axios from 'axios';
  import { DIR } from '$lib/config';
  import { selectJoin } from '$lib/dictionary';
	import { socket } from '$lib/socket';
  import { contact, switchs, users, groups, list, options } from '$lib/store';
	import { Option } from '$lib/types/enums';
  import Box from './Contact.svelte';
	
	let input = '';
	let usersValues: IForeign[];
	let groupsValues: IGroup[];
	let listValues: IList[];
	let selected: string;

	const unsubUsers = users.subscribe(value => usersValues = value as IForeign[]);
	const unsubGroups = groups.subscribe(value => groupsValues = value as IGroup[]);
	const unsubLists = groups.subscribe(value => listValues = value as IList[]);

	async function searchUser() {
		const data: ResponseData = await axios({
			method: 'GET',
			url: DIR + '/api/home/search/' + input,
			withCredentials: true
		}).then(res => res.data)
			.catch(err => err.response?.data);

		if (data.contacts) {
			list.setLists(data.contacts);
			switchs.setOption(Option.SEARCH);
		}

		input = '';
	}

	const joinRoom = (foreign: IForeign | IGroup) => {
		options.resetOptions();
		contact.setContact(foreign as never);
		switchs.setOption(Option.CHAT);
		socket.emit(selectJoin[foreign.type], foreign.contactID, foreign.roomID);
	};

	export const loadContacts = ([contactsUsers, contactsGroups]: Contacts) => {
		users.setUsers(contactsUsers);
		groups.setGroups(contactsGroups);

		if (contactsUsers.length > 0) selected = Option.CHATS;
		else if (contactsGroups.length > 0) selected = Option.ROOMS
		else selected = Option.CHATS;
	};

	const updateContacts = (contact: Contact, emit: boolean) => {
		if (contact.type === Option.GROUP) {
			groups.setGroups([...groupsValues, contact]);
		} else users.setUsers([...usersValues, contact]);

		const actList = listValues.filter(user => user.contactID !== contact.contactID);
		list.setLists(actList);
		
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
			unsubLists
		}
	})
</script>

<div class="sidebar">
	<form on:submit|preventDefault={searchUser}>
		<button class="search">
			<i class="fa-solid fa-search"></i>
		</button>
		<input type="text" placeholder="Search a contact" bind:value={input}>
	</form>
	<button
		class='button {selected === Option.CHATS ? 'selected' : ''}'
		on:click={() => selected = Option.CHATS}
	><i class='fa-solid fa-message'></i></button>
	<button
		class='button {selected === Option.ROOMS ? 'selected' : ''}'
		on:click={() => selected = Option.ROOMS}
	><i class='fa-solid fa-users'></i></button>
	<ul>
		{#if selected === Option.CHATS}
			{#if usersValues.length > 0}
				{#each usersValues as user (user.contactID)}
					<Box contact={user} join={joinRoom} /> 
				{/each}
			{:else}
				<div>No contacts yet</div>
			{/if}
		{:else if selected === Option.ROOMS}
			{#if groupsValues.length > 0}
				{#each groupsValues as group (group.roomID)}
					<Box contact={group} join={joinRoom}/>
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

	form button {
		padding: 15px 30px;
		cursor: pointer;
	}

	form input {
		@apply w-full;
	}

	form i {
		color: #666666;
		@apply text-xl leading-none;
	}

	.button {
		height: 70px;
		border: 3px solid #888888;
		color: #777777;
		@apply flex relative items-center justify-center w-1/2 font-bold cursor-pointer gap-2;
  }

	.button i {
		@apply flex items-center justify-center text-2xl leading-none;
	}

	.selected {
		border: 3px solid #3d7cf1;
		color: #3d7cf1;
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
