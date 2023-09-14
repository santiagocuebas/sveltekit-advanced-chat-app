<script lang='ts'>
	import type { ResponseData } from '$lib/types/global';
	import { onMount, onDestroy } from 'svelte';
	import axios from 'axios';
  import { DIR } from '$lib/config';
  import { socket } from '$lib/socket';
  import sockets, { unsubContact, unsubUsers, unsubGroups } from '$lib/sockets';
  import { user, register } from '$lib/store';
  import Sign from '$lib/components/Sign.svelte';
  import Signin from '$lib/components/Signin.svelte';
  import Register from '$lib/components/Register.svelte';

	async function loadUser() {
		const data: ResponseData = await axios({
			method: 'GET',
			url: DIR + '/api/home/main',
			withCredentials: true
		}).then(res => res.data)
			.catch(err => err);

		if (data.user) {
			user.setUser(data.user);
			socket.auth = { sessionID: data.user.id };
			socket.connect();
			register.setOption('user');
		} else {
			register.setOption('signin');
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
			<Sign title='Signin'>
				<Signin />
			</Sign>
			{:else if $register.register}
			<Sign title='Register'>
				<Register />
			</Sign>
			{:else}
			<Sign title='Loading' />
		{/if}
	</div>
</div>

<style lang='postcss'>
	:global(*) {
		box-sizing: border-box;
		font-family: 'Quicksand', Helvetica, monospace;
		@apply m-0 p-0 text-base leading-none;
	}

	:global(a) {
		color: #000000;
		text-decoration: none;
	}

	:global(input, select, textarea, button) {
		border: none;
		outline: none;
		background-color: #ffffff;
	}

	:global(textarea) {
		resize: none;
	}

	:global(ul, li) {
		list-style-type: none;
	}

	:global(input[type='file']) {
		@apply hidden;
	}

	.main {
		min-height: 665px;
		padding: 27.5px 35px;
		background-color: #000000;
		@apply grid fixed items-start justify-items-center w-full h-screen;
	}

	.banner {
		background-color: #3d7cf1;
		@apply absolute w-full h-1/2;
	}

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
