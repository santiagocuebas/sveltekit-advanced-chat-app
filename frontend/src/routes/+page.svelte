<script lang="ts">
	import type { PageServerData } from './$types';
	import type { IContact, Contacts as IContacts } from '$lib/global';
  import { TypeContact } from '$lib/enums';
	import { socket } from '$lib/socket.js';
	import { onDestroy, onMount } from 'svelte';
  import { userData, contact, switchs, groups, users } from '$lib/store';
  import UserHeader from '$lib/components/UserHeader.svelte';
  import Contacts from '$lib/components/Contacts.svelte';
  import ChatBox from '$lib/components/ChatBox.svelte';
  import ChatUser from '$lib/components/ChatUser.svelte';
  import Search from '$lib/components/Search.svelte';
  import Group from '$lib/components/Group.svelte';
  import Settings from '$lib/components/Settings.svelte';

	export let data: PageServerData;
	userData.setUser(data.user);
	let contactID: string;
	let usersValue: IContact[];
	let groupsValue: IContact[];
	
	const unsubUser = users.subscribe(value => usersValue = value as IContact[]);	

	const unsubGroup = groups.subscribe(value => groupsValue = value as IContact[]);

	const loadContacts = ([contactsUsers, contactsGroups]: IContacts) => {
		users.setContacts(contactsUsers);
		groups.setContacts(contactsGroups);
	};

	const loggedUser = (id: string, logged: boolean) => {
		const reloadUsers = usersValue.map((user: IContact) => {
			if (user.contactID === id) {
				user.logged = logged;
			}

			return user;
		});

		if ($contact.contactID === id && $contact.type === TypeContact.USER) {
			contact.changeLogged(logged);
		}

		users.setContacts(reloadUsers);
	};

	const countMembers = (id: string, num: number) => {
		const reloadGroups = groupsValue.map((group: IContact) => {
			if (typeof group.logged === 'number' && group.contactID === id)
			group.logged = group.logged + num;

			return group;
		});

		// if (
		// 	$contact.mods?.includes(id) ||
		// 	$contact.members?.includes(id)
		// ) {
			contact.countLogged(num);
		// }

		groups.setContacts(reloadGroups);
	};

	const editUsers = (room: string, content: string, createdAt: Date) => {
		const reloadUsers = usersValue.map(user => {
			if (user.roomID === room) {
				user.content = content;
				user.createdAt = createdAt;
			};

			return user;
		})

		users.setContacts(reloadUsers);
	};

	const editGroups = (room: string, content: string, createdAt: Date) => {
		const reloadUsers = groupsValue.map(group => {
			if (group.roomID === room) {
				group.content = content;
				group.createdAt = createdAt;
			};

			return group;
		})

		groups.setContacts(reloadUsers);
	};

	const editContacts = (room: string, content: string, createdAt: Date) => {
		if (room.length > 24) editUsers(room, content, createdAt);
		else editGroups(room, content, createdAt);
	};

	const leaveUser = (id: string) => {
		const reloadUsers = usersValue.filter(user => user.contactID !== id);
		users.setContacts(reloadUsers);
		switchs.resetOptions();

		if ($contact.contactID === id) contact.resetContact();
	};

	const leaveGroup = (id: string) => {
		const reloadGroups = groupsValue.filter(user => user.contactID !== id);
		groups.setContacts(reloadGroups);
		switchs.resetOptions();

		if ($contact.contactID === id) contact.resetContact();
	};

	onMount(() => {
		socket.auth = { sessionID: data.user.id };
		socket.connect();
	
		socket.on('loadContacts', loadContacts);
		socket.on('loggedUser', loggedUser);
		socket.on('countMembers', countMembers);
		socket.on('editContacts', editContacts);
		socket.on('leaveUser', leaveUser);
		socket.on('leaveGroup', leaveGroup);

		return () => {
			socket.off('loadContacts', loadContacts);
			socket.off('loggedUser', loggedUser);
			socket.off('countMembers', countMembers);
			socket.off('editContacts', editContacts);
			socket.off('leaveUser', leaveUser);
			socket.off('leaveGroup', leaveGroup);
		}
	});
	
	onDestroy(() => {
		return { unsubUser, unsubGroup }
	});
</script>

<div class="container">
	<UserHeader bind:contactID={contactID} />
	<Contacts bind:id={contactID} />
	{#if $switchs.chat}
		<ChatUser
			editGroups={editGroups}
			leaveUser={leaveUser}
			leaveGroup={leaveGroup}
		/>
		{:else if $switchs.search}
		<Search />
		{:else if $switchs.group}
		<Group />
		{:else if $switchs.settings}
		<Settings />
		{:else}
		<ChatBox />
	{/if}
</div>

<style lang="postcss">
	.container {
		grid-template-columns: minmax(300px, 30%) minmax(299px, 1fr);
		grid-auto-rows: min-content 1fr min-content;
		max-height: 900px;
		background-color: #999999;
		box-shadow: 0 0 0 1px #999999;
		z-index: 25;
		@apply grid relative w-full h-full gap-x-px gap-y-px;
	}
</style>
