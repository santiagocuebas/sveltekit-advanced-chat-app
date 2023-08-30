<script lang="ts">
	import type { IUser } from '$lib/global';
	import axios from 'axios';
	import { DIR } from '$lib/config.js';
  import { socket } from '$lib/socket';
  import { user, contact, switchs, list, register, users, groups } from '$lib/store';
  import Lists from "./List.svelte";

  export let contactID: string;

	let visible = false;
	let allowed = true;

	function loadChat(option: string) {
		visible = false;
		allowed = true;
		contactID = '';
		switchs.setOption(option);
		contact.resetContact();
		list.resetContacts();
	}

	async function handleLogout() {
		const data = await axios({
			method: 'POST',
			url: DIR + '/api/auth/logout',
			withCredentials: true
		}).then(res => res.data);

		visible = false;
		allowed = true;

		if (!data.user) {
			socket.disconnect();
			register.setOption('signin');
			switchs.resetOptions();
			users.resetContacts();
			groups.resetContacts();
			user.setUser({ } as IUser);
		};
	}
</script>

<div>
	<img src={`${DIR}/uploads/avatar/${$user.avatar}`} alt={$user.id}>
	<p title={$user.username}>{$user.username}</p>
	<Lists bind:visible={visible} bind:allowed={allowed}>
		<li on:mousedown={() => loadChat('group')}>
			<i class="fa-solid fa-circle-stop"></i>
			Create Group
		</li>
		<li on:mousedown={() => loadChat('settings')}>
			<i class="fa-solid fa-gear"></i>
			Settings
		</li>
		<li on:mousedown={handleLogout}>
			<i class="fa-solid fa-right-from-bracket"></i>
			Logout
		</li>
	</Lists>
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
