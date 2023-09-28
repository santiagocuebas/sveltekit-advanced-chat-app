<script lang="ts">
	import type { RawUser, ResponseData } from '$lib/types/global';
	import axios from 'axios';
	import { DIR } from '$lib/config.js';
  import { socket } from '$lib/socket';
  import { Option } from '$lib/types/enums';
  import {
		user,
		contact,
		switchs,
		list,
		register,
		users,
		groups
	} from '$lib/store';
  import List from "./List.svelte";

	let visible = false;

	function loadChat(option: string) {
		visible = false;
		switchs.setOption(option);
		contact.resetContact();
		list.resetContacts();
	}

	async function handleLogout() {
		visible = false;

		const data: ResponseData = await axios({
			method: 'POST',
			url: DIR + '/api/auth/logout',
			withCredentials: true
		}).then(res => res.data)
			.catch(err => err.response.data);

		if (data.logout) {
			socket.disconnect();
			register.setOption(Option.SIGNIN);
			switchs.resetOptions();
			users.resetContacts();
			groups.resetContacts();
			user.setUser({ } as RawUser);
		};
	}
</script>

<div>
	<img src={`${DIR}/uploads/avatar/${$user.avatar}`} alt={$user.id}>
	<p title={$user.username}>{$user.username}</p>
	<List bind:visible={visible}>
		{#if !$switchs.group}
			<li on:click={() => loadChat(Option.GROUP)} role='none'>
				<i class="fa-solid fa-circle-stop"></i>
				Create Group
			</li>
		{/if}
		{#if !$switchs.settings}
			<li on:click={() => loadChat(Option.SETTINGS)} role='none'>
				<i class="fa-solid fa-gear"></i>
				Settings
			</li>
		{/if}
		<li on:click={handleLogout} role='none'>
			<i class="fa-solid fa-right-from-bracket"></i>
			Logout
		</li>
	</List>
</div>

<style lang="postcss">
	div {
		background-color: #e7e7e7;
		z-index: 152;
		@apply flex relative items-center w-full h-full p-2.5 gap-2.5;
	}

	img {
		min-width: 40px;
		min-heigth: 40px;
		box-shadow: 0 0 5px #999999;
		@apply w-10 h-10 object-cover rounded-full;
	}

	p {
		@apply w-max overflow-hidden text-ellipsis text-xl font-semibold;
	}

	li {
		padding: 5px 20px;
		@apply flex items-center justify-start font-bold leading-tight gap-5;
	}

	li:hover {
		background-color: #999999;
		color: #ffffff;
	}

	li i {
		@apply text-xl leading-none;
	}
</style>
