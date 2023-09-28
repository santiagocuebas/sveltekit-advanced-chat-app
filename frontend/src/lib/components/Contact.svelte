<script lang="ts">
  import type { IForeign, IGroup } from "$lib/types/global";
	import { DIR } from '$lib/config.js';
  import { avatarURL } from "$lib/dictionary";
	import { contact as user } from '$lib/store';
  import { getDate } from "$lib/services/libs";

  export let contact: IForeign | IGroup;
  export let join: (value: IForeign | IGroup) => void;
</script>

<li
	class:selected={$user.contactID === contact.contactID}
	on:mousedown={() => join(contact)}
	role='none'
>
	{#if contact.logged === true}
		<span>&#149;</span>
	{/if}
  <img
		src={DIR + avatarURL[contact.type] + contact.avatar}
		alt={contact.contactID}
	>
  <div>
		<p class="contact-title" title={contact.name}>{contact.name}</p>
		{#if contact.content}
			<p class="content">
				{contact.content instanceof Array ? contact.content[0] : contact.content}
			</p>
		{/if}
	</div>
  {#if contact.createdAt}
		<p class="createdAt">{getDate(contact.createdAt)}</p>
  {/if}
</li>

<style lang="postcss">
  li {
		column-gap: 5px;
		@apply flex items-center w-full p-2.5 overflow-hidden font-medium;
	}

	li:hover {
		background-color: #e7e7e7;
	}

	.selected {
		background-color: #e7e7e7;
	}

	span {
		font-size: 32px;
		color: #1e9224;
	}

	img {
		grid-row: 1 / span 2;
		min-width: 64px;
		min-height: 64px;
		box-shadow: 0 0 5px #999999;
		@apply w-16 h-16 object-cover rounded-full;
	}

	div {
		@apply w-full h-full flex flex-wrap;
	}

	p {
		@apply overflow-hidden text-ellipsis break-words;
	}

	.contact-title {
		@apply w-full h-5 max-h-5 text-lg font-semibold leading-none;
	}

	.content {
		width: 100%;
		height: 35px;
	}

	.createdAt {
		min-width: 44px;
		max-width: 44px;
		@apply w-11 ml-auto self-start text-center;
	}
</style>
