<script lang="ts">
	import type { IUser } from '$lib/global';
	import axios from 'axios';
	import { DIR } from '$lib/config.js';
	import { clickOutside } from '$lib/services/out-click';

	export let user: IUser;
	let visible = false;
	let allowed = true;

	function showBox() {
		if (allowed) {
			setTimeout(() => {
				visible = true;
				allowed = false;
			}, 0);
		}
	}

	function occultBox() {
		visible = false;
		setTimeout(() => allowed = true, 50);
	}

	async function handleLogout(this: HTMLAnchorElement) {
		const data = await axios({
			method: 'POST',
			url: DIR + '/api/auth/logout',
			withCredentials: true
		}).then(res => res.data);

		visible = false;
		allowed = true;

		if (data.logout) window.location.href = '/signin';
	}
</script>

<div>
	<img src={`${DIR}/uploads/avatar/${user?.avatar || 'avatar.png'}`} alt={user?._id}>
	<p title={user?.username}>{user?.username}</p>
	<button on:click={showBox}>
		<i class="fa-solid fa-ellipsis-vertical"></i>
	</button>
	{#if visible}
		<ul use:clickOutside on:outclick={occultBox}>
			<a href="/logout" on:click|preventDefault={handleLogout}>
				<i class="fa-solid fa-right-from-bracket"></i>
				<li>Logout</li>
			</a>
		</ul>
	{/if}
</div>

<style lang="postcss">
	div {
		background-color: #e7e7e7;
		z-index: 52;
		@apply flex relative items-center w-full h-full p-2.5 gap-2.5;
	}

	img {
		@apply w-10 h-10 rounded-full;
	}

	p {
		@apply w-full overflow-hidden text-ellipsis text-xl font-semibold;
	}

	button {
		background-color: #e7e7e7;
		@apply p-2.5 rounded-full cursor-pointer leading-none;
	}

	button:hover {
		background-color: #cccccc;
	}

	button i {
		@apply w-5 h-5 text-xl leading-none;
	}

	ul {
		background-color: #ffffff;
		box-shadow: 0 0 10px #aaaaaa;
		@apply absolute self-start right-0 mt-10 py-2 rounded;
	}

	a {
		padding: 5px 20px;
		@apply flex items-center gap-5;
	}

	a:hover {
		background-color: #aaaaaa;
		color: #ffffff;
	}

	ul i {
		@apply text-xl leading-none;
	}

	li {
		@apply font-bold;
	}
</style>
