<script lang="ts">
  import type { IForeign, IGroup } from "$lib/types/global";
	import { DIR } from "$lib/config";
  import { getDate, getUrl } from "$lib/services";
	import { options, contact as user } from '$lib/store';

  export let contact: IForeign | IGroup;

	$: ({ contactID, type, logged, avatar, name, content, createdAt } = contact);

	const joinRoom = (contact: IForeign | IGroup) => {
		options.resetOptions();
		user.setContact(contact as never);
	};
</script>

<a href="/{type}s/{contactID}" on:click={() => joinRoom(contact)}>
	<li class:selected={$user?.contactID === contactID}>
		<span
			class:green={logged === true}
			class:blue={logged instanceof Array}
		>&#149;</span>
		<picture>
			<img src={DIR + '/' + avatar} alt={contactID}>
		</picture>
		<div>
			<h3 title={name}>
				{name}
			</h3>
			{#if content}
				{content instanceof Array ? getUrl(content[0]) : content}
			{/if}
		</div>
		{#if createdAt}
			<p>
				{getDate(createdAt)}
			</p>
		{/if}
	</li>
</a>

<style lang="postcss">
  li {
		@apply flex w-full h-20 p-2 overflow-hidden font-medium gap-x-1 hover:bg-[#e7e7e7] [&.selected]:bg-[#e7e7e7];
	}

	span {
		@apply self-center min-w-[12px] text-[32px] text-[#444444] [&.green]:text-[#1e9224] [&.blue]:text-[#62bdf1];
	}

	picture {
		@apply flex-none w-16 h-16;
	}

	img {
		box-shadow: 0 0 4px #999999;
		@apply w-full h-full object-cover rounded-full;
	}

	div {
		@apply overflow-hidden break-words;
	}

	h3 {
		@apply h-5 overflow-hidden text-ellipsis text-[18px] font-semibold;
	}

	p {
		@apply flex-none w-[42px] ml-auto text-center;
	}
</style>
