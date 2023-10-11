<script lang="ts">
  import type { IForeign, IGroup } from "$lib/types/global";
	import { DIR } from '$lib/config.js';
  import { avatarURL } from "$lib/dictionary";
	import { contact as user } from '$lib/store';
  import { getDate } from "$lib/services/libs";
  import { Option } from "$lib/types/enums";

  export let contact: IForeign | IGroup;
  export let join: (value: IForeign | IGroup) => void;
</script>

<li
	class:selected={$user.contactID === contact.contactID}
	on:click={() => join(contact)}
	role='none'
>
	<span
		class:green={contact.logged}
		class:blue={contact.type === Option.GROUP}
	>&#149;</span>
  <img
		src={DIR + avatarURL[contact.type] + contact.avatar}
		alt={contact.contactID}
	>
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
		@apply flex w-full h-20 p-2 overflow-hidden font-medium gap-x-1;
	}

	li:hover {
		background-color: #e7e7e7;
	}

	.selected {
		background-color: #e7e7e7;
	}

	span {
		min-width: 12px;
		color: #444444;
		font-size: 32px;
		@apply self-center;
	}

	.green {
		color: #1e9224;
	}

	.blue {
		color: #62bdf1;
	}

	img {
		min-width: 64px;
		box-shadow: 0 0 5px #999999;
		@apply w-16 h-16 object-cover rounded-full;
	}

	div {
		@apply overflow-hidden break-words;
	}

	h3 {
		@apply h-5 overflow-hidden text-ellipsis text-lg font-semibold leading-none;
	}

	p {
		width: 42px;
		min-width: 42px;
		@apply ml-auto text-center;
	}
</style>
