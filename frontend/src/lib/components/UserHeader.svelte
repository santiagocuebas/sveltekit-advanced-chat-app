<script lang="ts">
	import axios from 'axios';
	import { DIR } from '$lib/config.js';
  import { socket } from '$lib/socket';
  import { userData, contact, switchs, list } from '$lib/store';
  import Lists from "./List.svelte";

  export let contactID: string;

	const { id, username, avatar } = userData.getUser();
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

		if (data.logout) {
			socket.disconnect();
			window.location.href = '/signin';
		};
	}
</script>

<div>
	<img src={`${DIR}/uploads/avatar/${avatar}`} alt={id}>
	<p title={username}>{username}</p>
	<Lists bind:visible={visible} bind:allowed={allowed}>
		<a href="#placeholder1" on:click|preventDefault={() => loadChat('group')}>
			<i class="fa-solid fa-circle-stop"></i>
			<li>Create Group</li>
		</a>
		<a href="#placeholder2" on:click|preventDefault={() => loadChat('settings')}>
			<i class="fa-solid fa-gear"></i>
			<li>Settings</li>
		</a>
		<a href="/logout" on:click|preventDefault={handleLogout}>
			<i class="fa-solid fa-right-from-bracket"></i>
			<li>Logout</li>
		</a>
	</Lists>
</div>

<style lang="postcss">
	div {
		background-color: #e7e7e7;
		z-index: 152;
		@apply flex relative items-center w-full h-full p-2.5 gap-2.5;
	}

	img {
		@apply w-10 h-10 rounded-full;
	}

	p {
		@apply w-max overflow-hidden text-ellipsis text-xl font-semibold;
	}

	a {
		padding: 5px 20px;
		@apply flex items-center justify-start gap-5;
	}

	a:hover {
		background-color: #999999;
		color: #ffffff;
	}

	a i {
		@apply text-xl leading-none;
	}

	li {
		@apply font-bold leading-tight;
	}
</style>
