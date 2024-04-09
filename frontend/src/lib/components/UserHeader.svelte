<script lang="ts">
  import { goto } from '$app/navigation';
	import jsCookie from 'js-cookie';
  import { List } from "./index";
  import axios from '$lib/axios';
  import { socket } from '$lib/socket';
  import { user, contact, contacts, register } from '$lib/store';
  import { Option } from '$lib/types/enums';

	let visible = false;

	async function handleLogout() {
		visible = false;

		const token = jsCookie.get('authenticate');

		if (token) jsCookie.remove('authenticate');
		
		axios.defaults.headers.common['Authorization'] = '';
		
		socket.disconnect();
		register.resetOptions();
		contacts.resetContacts();
		contact.resetContact();
		user.resetUser();
		goto('/register');
		setTimeout(() => register.setOption(Option.REGISTER), 3000);
	}
</script>

<div>
	<picture>
		<img src={$user.avatar} alt={$user.id}>
	</picture>
	<p title={$user.username}>{$user.username}</p>
	<List bind:visible={visible}>
		<a href="/group" on:click={() => visible = false}>
			<li>
				<i class="fa-solid fa-circle-stop"></i>
				Create Group
			</li>
		</a>
		<a href="/settings" on:click={() => visible = false}>
			<li>
				<i class="fa-solid fa-gear"></i>
				Settings
			</li>
		</a>
		<li on:click|preventDefault={handleLogout} role='none'>
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
		box-shadow: 0 0 4px #999999;
		@apply w-full h-full object-cover rounded-full;
	}

	p {
		@apply w-max overflow-hidden text-ellipsis text-xl font-semibold;
	}

	li {
		@apply flex items-center justify-start py-[5px] px-5 font-bold leading-tight gap-5 cursor-pointer hover:bg-[#999999] hover:text-white [&_i]:text-[20px];
	}
</style>
