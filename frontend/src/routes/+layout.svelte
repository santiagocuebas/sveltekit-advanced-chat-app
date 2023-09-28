<script lang='ts'>
	import type { ResponseData } from '$lib/types/global';
	import { onMount, onDestroy } from 'svelte';
	import axios from 'axios';
  import { DIR } from '$lib/config';
  import { socket } from '$lib/socket';
  import sockets, { unsubContact, unsubUsers, unsubGroups } from '$lib/sockets';
  import { user, register } from '$lib/store';
  import { Inputs, InputsSignin, Option } from '$lib/types/enums';
  import Sign from '$lib/components/Sign.svelte';

	const registerInputs = Object.values(Inputs);
	const signinInputs = Object.values(InputsSignin);

	async function loadUser() {
		const data: ResponseData = await axios({
			method: 'GET',
			url: DIR + '/api/home/main',
			withCredentials: true
		}).then(res => res.data)
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
		grid-template-columns: minmax(300px, 30%) 1fr;
		grid-auto-rows: min-content 1fr min-content;
		min-width: 600px;
		max-height: 900px;
		border: 1px solid transparent;
		background-color: #999999;
		z-index: 25;
		@apply grid relative w-full h-full gap-x-px gap-y-px;
	}

	:global(.container-box) {
		grid-column: 2 / span 1;
		grid-row: 1 / span 3;
		background-color: #ffffff;
		scrollbar-width: none;
		z-index: 200;
		@apply grid relative content-start justify-items-center py-10 px-2.5 overflow-y-scroll gap-5;
	}

	:global(.close) {
		margin-top: -30px;
		@apply justify-self-end flex fixed items-center justify-center w-9 h-9 font-bold leading-none;
	}

	:global(.close i) {
		color: #b2b2b2;
		@apply text-4xl font-bold leading-none cursor-pointer;
	}

	:global(.close i:hover) {
		color: #a3a3a3;
	}

	:global(.title) {
		@apply text-center text-lg font-semibold;
		line-height: 1.09;
	}
</style>
