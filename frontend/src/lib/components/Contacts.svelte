<script lang="ts">
  import type { IContact, IList } from '$lib/global';
  import { DIR } from '$lib/config';
	import { ButtonValue, TypeContact } from '$lib/enums';
  import { contact, switchs, users, groups, list, options } from '$lib/store';
	import { socket } from '$lib/socket';
  import { onDestroy, onMount } from 'svelte';
  import axios from 'axios';
  import Button from './Button.svelte';
  import Contacts from './Contact.svelte';

	export let id: string;
	
	let input = '';
	let usersValues: IContact[];
	let groupsValues: IContact[];
	let listValues: IList[];
	let selected = ButtonValue.CHATS;

	const unsubUsers = users.subscribe(value => usersValues = value as IContact[]);
	const unsubGroups = groups.subscribe(value => groupsValues = value as IContact[]);
	const unsubList = list.subscribe(value => listValues = value as IList[]);

	async function searchUser() {
		const data: IList[] = await axios({
			method: 'GET',
			url: DIR + '/api/home/search/' + input,
			withCredentials: true
		}).then(res => res.data);

		list.setContacts(data);
		switchs.setOption('search');
	}

	const joinRoom = (foreign: IContact) => {
		options.resetOptions();
		id = foreign.contactID;
		contact.setContact(foreign);
		switchs.setOption('chat');
		socket.emit('joinRoom', foreign.contactID, foreign.roomID);
	};

	const reloadUsers = (contact: IContact) => {
		if (contact.type === TypeContact.GROUP) {
			selected = ButtonValue.ROOMS;
			groups.setContacts([...groupsValues, contact]);
		} else {
			selected = ButtonValue.CHATS;
			users.setContacts([...usersValues, contact]); 
		}

		const actList = listValues.filter(user => user.id !== contact.contactID);
		list.setContacts(actList);
		socket.emit('joinUpdate', contact.roomID);
	};

	onMount(() => {
		socket.on('updateContacts', reloadUsers);

		return () => {
			socket.off('updateContacts', reloadUsers);
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

	.sidebar div {
		color: #666666;
		@apply flex items-center justify-center w-full p-2.5 text-center text-2xl font-semibold leading-tight break-words;
	}
</style>
