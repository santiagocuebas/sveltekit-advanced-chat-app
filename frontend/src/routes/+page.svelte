<script lang="ts">
  import type { IContact, Contacts as IContacts, IKeys } from '$lib/global';
  import { TypeContact } from '$lib/enums';
	import { socket } from '$lib/socket.js';
	import { onDestroy, onMount } from 'svelte';
  import { contact, switchs, groups, users, user, register } from '$lib/store';
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
	let usersValues: IContact[];
	let groupsValues: IContact[];

	const unsubUsers = users.subscribe(value => usersValues = value as IContact[]);
	const unsubGroups = groups.subscribe(value => groupsValues = value as IContact[]);
	
	const loadContacts = ([contactsUsers, contactsGroups]: IContacts) => {
		users.setContacts(contactsUsers);
		groups.setContacts(contactsGroups);
	};

	const loggedUser = (id: string, logged: boolean) => {
		const reloadUsers = usersValues.map(user => {
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
		const reloadGroups = groupsValues.map(group => {
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
		const reloadUsers = usersValues.map(user => {
			if (user.roomID === room) {
				user.content = content;
				user.createdAt = createdAt;
			};

			return user;
		});

		users.setContacts(reloadUsers);
	};

	const editGroups = (room: string, content: string, createdAt: Date) => {
		const reloadUsers = groupsValues.map(group => {
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

	const leaveUser = (id: string, room: string) => {
		const reloadUsers = usersValues.filter(user => user.contactID !== id);
		users.setContacts(reloadUsers);
		switchs.resetOptions();
		socket.emit('removeRoom', room);

		if ($contact.contactID === id) contact.resetContact();
	};

	const leaveGroup = (id: string, room: string) => {
		const reloadGroups = groupsValues.filter(user => user.contactID !== id);
		groups.setContacts(reloadGroups);
		switchs.resetOptions();
		socket.emit('removeRoom', room);

		if ($contact.contactID === id) contact.resetContact();
	};

	const connectError = (err: Error) => {
		if (err.message === 'Unauthorized') {
			user.resetUser();
			users.resetContacts();
			groups.resetContacts();
			switchs.resetOptions();
			register.setOption('signin');
		}
	};

	const socketError = (err: IKeys<string>) => errorMessage = err;

	const invalidSocket = () => {
		errorMessage = {
			error: 'Socket Error',
			message: 'The socket emitted no exist'
		};
	};

	onMount(() => {
		socket.on('loggedUser', loggedUser);
		socket.on('countMembers', countMembers);
		socket.on('loadContacts', loadContacts);
		socket.on('editContacts', editContacts);
		socket.on('leaveUser', leaveUser);
		socket.on('leaveGroup', leaveGroup);
		socket.on('socketError', socketError);
		socket.on('invalidSocket', invalidSocket);
		socket.on('connect_error', connectError);

		return () => {
			socket.off('loggedUser', loggedUser);
			socket.off('countMembers', countMembers);
			socket.off('loadContacts', loadContacts);
			socket.off('editContacts', editContacts);
			socket.off('leaveUser', leaveUser);
			socket.off('leaveGroup', leaveGroup);
			socket.off('socketError', socketError);
			socket.off('invalidSocket', invalidSocket);
			socket.off('connect_error', connectError);
		}
	});

	onDestroy(() => {
		return { unsubUsers, unsubGroups }
	})
</script>

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
{#if errorMessage}
	<ErrorMessage bind:error={errorMessage} />
{/if}
