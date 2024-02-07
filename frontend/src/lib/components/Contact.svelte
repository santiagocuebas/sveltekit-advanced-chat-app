<script lang="ts">
  import type { IForeign, IGroup } from "$lib/types/global";
	import { DIR } from '$lib/config';
  import { avatarURL } from "$lib/dictionary";
	import { contact as user } from '$lib/store';
  import { getDate } from "$lib/services/libs";

  export let contact: IForeign | IGroup;
  export let join: (value: IForeign | IGroup) => void;
</script>

<li
	class:selected={$user.contactID === contact.contactID}
	on:click={() => join(contact)}
	role='none'
>
	<span
		class:green={contact.logged === true}
		class:blue={typeof contact.logged === 'number'}
	>&#149;</span>
  <picture>
		<img
			src={DIR + avatarURL[contact.type] + contact.avatar}
			alt={contact.contactID}
		>
	</picture>
	<div>
		<h3 title={contact.name}>{contact.name}</h3>
		{#if contact.content}
			{contact.content instanceof Array ? contact.content[0] : contact.content}
		{/if}
	</div>
	{#if contact.createdAt}
		<p>{getDate(contact.createdAt)}</p>
	{/if}
</li>

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
