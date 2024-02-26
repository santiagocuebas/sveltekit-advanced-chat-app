<script lang='ts'>
	import type { IKeys, ResponseData } from '$lib/types/global';
	import { onMount, onDestroy } from 'svelte';
	import jsCookie from 'js-cookie';
	import axios from '$lib/axios';
  import { Contacts, UserHeader } from '$lib/components';
  import { socket } from '$lib/socket';
  import sockets, { unsubContact, unsubUsers, unsubGroups } from '$lib/sockets';
  import { user, register } from '$lib/store';
  import { Option } from '$lib/types/enums';
	import '../app.css';
	
	let errorMessage: IKeys<string> | null = null;

	async function loadUser() {
		const token = jsCookie.get('authenticate');
		axios.defaults.headers.common['Authorization'] = token;
		
		const data: ResponseData = await axios({ url: '/auth' })
			.then(res => res.data)
			.catch(err => {
				return err.response ? err.response.data : { error: err.message };
			});

		if (data?.user) {
			user.setUser(data.user);

			setTimeout(() => {
				socket.auth = { sessionID: data.user.id, token };
				socket.connect();
				register.setOption(Option.USER);
			}, 3000);
		} else {
			console.log(data.error);
			const token = jsCookie.get('authenticate');

			if (token) jsCookie.remove('authenticate');
			setTimeout(() => register.setOption(Option.REGISTER), 3000);
		}
	}

	const socketError = (err: IKeys<string>) => {
		errorMessage = err;
		setTimeout(() => errorMessage = null, 5000);
	};
	
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
		socket.on('socketError', socketError);
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
			socket.off('socketError', socketError);
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
			<UserHeader />
			<Contacts />
			<slot />
			{#if errorMessage}
				<div class="error">
					<h3>{errorMessage?.error}</h3>
					<p>{errorMessage?.message}</p>
				</div>
			{/if}
		{:else if $register.register}
			<slot />
		{:else}
			<div class="main-loading">
				<picture>
					<img src="/images.svg" alt="title">
				</picture>
				<h1>
					Loading
				</h1>
			</div>
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
		box-shadow: 0 0 4px #999999;
		@apply grid relative w-full min-w-[600px] max-h-[900px] h-full bg-[#999999] gap-x-px gap-y-px z-[25];
	}

	.main-loading {
		grid-auto-rows: min-content;
		grid-column: 1 / span 2;
		grid-row: 1 / span 3;
		box-shadow: 0 0 4px #888888;
		@apply grid relative justify-items-center content-center w-full bg-white gap-5 [&_h1]:text-[56px];

		& picture {
			@apply w-[300px] h-[300px];
		}

		& img {
			animation: spin 4s linear infinite;
			@apply w-full h-full rounded-full;
		}
	}
	
	.error {
		grid-column: 2 / span 1;
		grid-row: 2 / span 1;
		border: 2px solid #9c1313;
		@apply grid absolute justify-items-center self-end justify-self-center w-[200px] m-1 p-2.5 bg-[#f1b1b1] rounded-2xl gap-1 z-[400];

		& h3 {
			@apply w-full overflow-hidden break-words text-center text-[24px];
		}

		& p {
			@apply w-full overflow-hidden break-words text-center text-[20px] leading-tight;
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

	@keyframes spin { 
    100% { 
      transform: rotate(360deg); 
  	}
	}
</style>
