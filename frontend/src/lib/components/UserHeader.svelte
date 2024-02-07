<script lang="ts">
	import type { RawUser, ResponseData } from '$lib/types/global';
  import { List } from "./index";
	import axios from '$lib/axios';
	import { DIR } from '$lib/config';
  import { avatarURL } from '$lib/dictionary';
  import { socket } from '$lib/socket';
  import { Method, Option } from '$lib/types/enums';
  import {
		user,
		contact,
		switchs,
		list,
		register,
		users,
		groups
	} from '$lib/store';

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
			method: Method.POST,
			url: '/auth/logout'
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
	<picture>
		<img src={DIR + avatarURL.user + $user.avatar} alt={$user.id}>
	</picture>
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
		@apply flex relative items-center w-full h-full p-2.5 bg-[#e7e7e7] gap-2.5 z-[160];
	}

	picture {
		@apply flex-none w-10 h-10 object-cover rounded-full;
	}

	img {
		box-shadow: 0 0 5px #999999;
		@apply w-full h-full object-cover rounded-full;
	}

	p {
		@apply w-max overflow-hidden text-ellipsis text-xl font-semibold;
	}

	li {
		@apply flex items-center justify-start py-[5px] px-5 font-bold leading-tight gap-5 hover:bg-[#999999] hover:text-white [&_i]:text-[20px];
	}
</style>
