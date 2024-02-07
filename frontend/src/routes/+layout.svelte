<script lang='ts'>
	import type { ResponseData } from '$lib/types/global';
	import { onMount, onDestroy } from 'svelte';
	import axios from '$lib/axios';
  import { Sign } from '$lib/components';
  import { socket } from '$lib/socket';
  import sockets, { unsubContact, unsubUsers, unsubGroups } from '$lib/sockets';
  import { user, register } from '$lib/store';
  import { Inputs, InputsSignin, Option } from '$lib/types/enums';

	const registerInputs = Object.values(Inputs);
	const signinInputs = Object.values(InputsSignin);

	async function loadUser() {
		const data: ResponseData = await axios({ url: '/home/main' })
			.then(res => res.data)
			.catch(err => {
				return err.response ? err.response.data : { error: err.message };
			});

		if (data?.user) {
			user.setUser(data.user);
			socket.auth = { sessionID: data.user.id };
			socket.connect();
			register.setOption(Option.USER);
		} else {
			register.setOption(Option.SIGNIN);
			console.log(data.error);
		}
	}
	
	onMount(() => {
		socket.on('loggedUser', sockets.loggedUser);
		socket.on('countMembers', sockets.countMembers);
		socket.on('editUser', sockets.editUsers);
		socket.on('editGroup', sockets.editGroups);
		socket.on('leaveUser', sockets.leaveUser);
		socket.on('leaveGroup', sockets.leaveGroup);
		socket.on('addMembers', sockets.addMembers);
		socket.on('banMembers', sockets.banMembers);
		socket.on('blockMembers', sockets.blockMembers);
		socket.on('unblockMembers', sockets.unblockMembers);
		socket.on('addMods', sockets.addMods);
		socket.on('removeMods', sockets.removeMods);
		socket.on('changeAvatar', sockets.changeAvatar);
		socket.on('destroyUser', sockets.destroyUser);
		socket.on('connect_error', sockets.connectError);

		return () => {
			socket.off('loggedUser', sockets.loggedUser);
			socket.off('countMembers', sockets.countMembers);
			socket.off('editUsers', sockets.editUsers);
			socket.off('editGroups', sockets.editGroups);
			socket.off('leaveUser', sockets.leaveUser);
			socket.off('leaveGroup', sockets.leaveGroup);
			socket.off('addMembers', sockets.addMembers);
			socket.off('banMembers', sockets.banMembers);
			socket.off('blockMembers', sockets.blockMembers);
			socket.off('unblockMembers', sockets.unblockMembers);
			socket.off('addMods', sockets.addMods);
			socket.off('removeMods', sockets.removeMods);
			socket.off('changeAvatar', sockets.changeAvatar);
			socket.off('destroyUser', sockets.destroyUser);
			socket.off('connect_error', sockets.connectError);
		}
	});

	onDestroy(() => {
		return {
			unsubContact,
			unsubUsers,
			unsubGroups
		}
	});
</script>

<svelte:document on:load={loadUser()} />

<div class="main">
	<div class="banner"></div>
	<div class="container">
		{#if $register.user}
			<slot />
		{:else if $register.signin}
			<Sign
				title={Option.SIGNIN}
				option={Option.REGISTER}
				inputs={signinInputs}
			/>
		{:else if $register.register}
			<Sign
				title={Option.REGISTER}
				option={Option.SIGNIN}
				inputs={registerInputs}
			/>
		{:else}
			<Sign title='loading' />
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

	.main {
		@apply grid fixed items-start justify-items-center w-full min-w-[665px] h-screen py-[27.5px] px-[35px] bg-black;
	}

	.banner {
		@apply absolute w-full h-1/2 bg-[#3d7cf1];
	}

	.container {
		grid-template-columns: minmax(300px, 30%) 1fr;
		grid-auto-rows: min-content 1fr min-content;
		outline: 1px solid #999999;
		@apply grid relative w-full min-w-[600px] max-h-[900px] h-full bg-[#999999] gap-x-px gap-y-px z-[25];
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
