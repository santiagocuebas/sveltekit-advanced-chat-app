<script lang='ts'>
	import type { LayoutServerData } from './$types';
	import type { IKeys, RawUser } from '$lib/types/global';
	import { beforeNavigate, goto } from '$app/navigation';
	import { onMount } from 'svelte';
  import { Contacts as BoxContacts, UserHeader, LoadingBox } from '$lib/components';
	import { connectSocket } from '$lib/services';
  import { socket } from '$lib/socket';
  import { user, register, contact, contacts } from '$lib/store';
  import { Option } from '$lib/types/enums';
	import '../app.css';

	export let data: LayoutServerData & { user: RawUser, token: string };

	let errorMessage: IKeys<string> | null = null;

	const socketError = (err: IKeys<string>) => {
		errorMessage = err;
		setTimeout(() => errorMessage = null, 5000);
	};

	const connectError = (err: Error) => {
		if (err?.message === 'Unauthorized') {
			register.resetOptions();
			user.resetUser();
			contacts.resetContacts();
			goto('/register');
			setTimeout(() => register.setOption(Option.REGISTER), 3000);
		}
	};

	onMount(() => {
		if (data.user) connectSocket(data.user, data.token);
		else {
			goto('/register');
			setTimeout(() => register.setOption(Option.REGISTER), 3000);
		}
	});
	
	onMount(() => {
		socket.on('checkId', (cb) => cb(socket.id));
		socket.on('addContact', contacts.addContact);
		socket.on('addGroup', contacts.addGroup);
		socket.on('loggedUser', contacts.loggedUser);
		socket.on('countUser', contacts.countUser);
		socket.on('discountUser', contacts.discountUser);
		socket.on('countMembers', contacts.countMembers);
		socket.on('discountMembers', contacts.discountMembers);
		socket.on('editUser', contacts.editUsers);
		socket.on('editGroup', contacts.editGroups);
		socket.on('leaveUser', contacts.leaveUser);
		socket.on('leaveGroup', contacts.leaveGroup);
		socket.on('addMembers', contacts.addMembers);
		socket.on('banMembers', contacts.banMembers);
		socket.on('blockMembers', contacts.blockMembers);
		socket.on('unblockMembers', contacts.unblockMembers);
		socket.on('addMods', contacts.addMods);
		socket.on('removeMods', contacts.removeMods);
		socket.on('changeAvatar', contacts.changeAvatar);
		socket.on('destroyUser', contacts.destroyUser);
		socket.on('socketError', socketError);
		socket.on('connect_error', connectError);

		return () => {
			socket.off('checkId', (cb) => cb(socket.id));
			socket.off('addContact', contacts.addContact);
			socket.off('addGroup', contacts.addGroup);
			socket.off('loggedUser', contacts.loggedUser);
			socket.off('countUser', contacts.countUser);
			socket.off('discountUser', contacts.discountUser);
			socket.off('countMembers', contacts.countMembers);
			socket.off('discountMembers', contacts.discountMembers);
			socket.off('editUsers', contacts.editUsers);
			socket.off('editGroups', contacts.editGroups);
			socket.off('leaveUser', contacts.leaveUser);
			socket.off('leaveGroup', contacts.leaveGroup);
			socket.off('addMembers', contacts.addMembers);
			socket.off('banMembers', contacts.banMembers);
			socket.off('blockMembers', contacts.blockMembers);
			socket.off('unblockMembers', contacts.unblockMembers);
			socket.off('addMods', contacts.addMods);
			socket.off('removeMods', contacts.removeMods);
			socket.off('changeAvatar', contacts.changeAvatar);
			socket.off('destroyUser', contacts.destroyUser);
			socket.off('socketError', socketError);
			socket.off('connect_error', connectError);
		}
	});

	beforeNavigate(({ to, delta }) => {
		if (
			delta &&
			to?.params &&
			(to.params.contact === Option.USERS || to.params.contact === Option.GROUPS) &&
			typeof to.params.id === 'string'
		) {
			const indexContact = to.params.contact;
			const foundContact = $contacts[indexContact].find(({ contactID }) => {
				return to.params?.id === contactID;
			});
			
			if (foundContact) contact.setContact(foundContact as never);
			else goto('/');
		}
	});
</script>

<div class="main-container">
	<div class="banner"></div>
	<div class="container-user">
		{#if $register.user}
			<UserHeader />
			<BoxContacts />
			<slot />
			{#if errorMessage}
				<div class="error">
					<h3>
						{errorMessage?.error}
					</h3>
					<p>
						{errorMessage?.message}
					</p>
				</div>
			{/if}
		{:else if $register.register}
			<slot />
		{:else}
			<LoadingBox className={'main-loading'} />
		{/if}
	</div>
</div>

<style lang='postcss'>
	:global(*) {
		box-sizing: border-box;
		font-family: 'Quicksand', Helvetica, monospace;
		@apply m-0 p-0 text-base leading-none;
	}

	:global(input, select, textarea, button) {
		border: none;
		outline: none;
		@apply bg-white;
	}

	:global(a) {
		@apply text-black no-underline;
	}

	:global(button) {
		@apply cursor-pointer;
	}

	:global(textarea) {
		@apply resize-none;
	}

	:global(ul, li) {
		@apply list-none;
	}

	:global(input[type='file']) {
		@apply hidden;
	}

	.main-container {
		@apply flex fixed justify-center w-full min-w-[665px] h-screen min-h-[570px] py-[27.5px] px-[35px] bg-black;
	}

	.banner {
		@apply absolute w-full h-1/2 top-0 left-0 bg-[#3d7cf1];
	}

	.container-user {
		grid-template-columns: minmax(300px, 30%) minmax(299px, 1fr);
		grid-auto-rows: min-content 1fr min-content;
		box-shadow: 0 0 2px #999999;
		@apply grid relative w-full h-full min-h-[520px] bg-[#999999] gap-x-px gap-y-px z-[50];
	}
	
	.error {
		grid-column: 2 / span 1;
		grid-row: 2 / span 1;
		border: 2px solid #9c1313;
		@apply grid absolute justify-items-center self-end justify-self-center w-[200px] mb-2.5 p-2.5 bg-[#f1b1b1] rounded-2xl gap-1 z-[400];

		& h3 {
			@apply w-full overflow-hidden break-words text-center font-semibold text-[20px];
		}

		& p {
			@apply w-full overflow-hidden break-words text-center text-[18px] leading-tight;
		}
	}

	:global(.container-box) {
		grid-column: 2 / span 1;
		grid-row: 1 / span 3;
		scrollbar-width: none;
		@apply grid relative content-start justify-items-center h-full py-10 px-2.5 bg-white overflow-y-scroll gap-5 z-[200];
	}

	:global(.close) {
		@apply justify-self-end flex fixed items-center justify-center w-9 h-9 mt-[-30px] font-bold leading-none;

		& :global(i) {
			@apply text-[36px] font-bold text-[#b2b2b2] hover:text-[#a3a3a3];
		}
	}

	:global(.title) {
		@apply text-center text-[18px] font-semibold leading-[1.09];
	}
</style>
