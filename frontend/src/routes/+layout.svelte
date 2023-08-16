<script lang='ts'>
	import axios from 'axios';
  import { DIR } from '$lib/config';
  import { socket } from '$lib/socket';
  import { user, register } from '$lib/store';
  import Sign from '$lib/components/Sign.svelte';
  import Signin from '$lib/components/Signin.svelte';
  import Register from '$lib/components/Register.svelte';

	async function testFunction() {
		const data = await axios({
			method: 'GET',
			url: DIR + '/api/home/main',
			withCredentials: true
		}).then(res => res.data);

		console.log(data.user);

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
</script>

<svelte:document on:load={testFunction()} />

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
