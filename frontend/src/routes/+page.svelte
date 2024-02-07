<script lang="ts">
  import type { IKeys } from '$lib/types/global';
	import { onMount } from 'svelte';
  import {
		ChatBody,
		ChatHeader,
		Contacts,
		Group,
		Search,
		Settings,
		UserHeader
	} from '$lib/components';
	import { socket } from '$lib/socket';
  import { switchs } from '$lib/store';
	
	let errorMessage: IKeys<string> | null = null;

	const socketError = (err: IKeys<string>) => {
		errorMessage = err;
		setTimeout(() => errorMessage = null, 5000);
	};

	onMount(() => {
		socket.on('socketError', socketError);

		return () => socket.off('socketError', socketError);
	});
</script>

<UserHeader />
<Contacts />
{#if $switchs.chat}
	<ChatHeader />
	<ChatBody />
{:else if $switchs.search}
	<Search />
{:else if $switchs.group}
	<Group />
{:else if $switchs.settings}
	<Settings />
{:else}
	<div class="logo">
		<picture>
			<img src="/smiley-main.jpg" alt="smiley placeholder">
		</picture>
		<h2>Welcome!</h2>
	</div>
{/if}
{#if errorMessage}
	<div class="error">
		<h3>{errorMessage?.error}</h3>
		<p>{errorMessage?.message}</p>
	</div>
{/if}

<style lang="postcss">
	.logo {
		grid-column: 2 / span 1;
		grid-row: 1 / span 3;
		@apply flex flex-wrap relative justify-center w-full h-full bg-[#f0f3f3] overflow-hidden z-[50];

		& picture {
			@apply self-end flex-none w-1/2 min-w-[295px] max-w-[480px] min-h-[295px] max-h-[480px];
		}

		& img {
			@apply w-full h-full rounded-full object-cover;
		}

		& h2 {
			@apply w-full min-h-min text-center text-6xl leading-none;
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
</style>
