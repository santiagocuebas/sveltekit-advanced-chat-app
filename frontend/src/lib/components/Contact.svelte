<script lang="ts">
  import type { IContact } from "$lib/types/global";
	import { DIR } from '$lib/config.js';
  import { getDate } from "$lib/services/libs";
  import { selectAvatarURL } from "$lib/services/chat-libs";

  export let contact: IContact;
  export let id: string;
  export let join: (value: IContact) => void;
</script>

<li
	class:selected={id === contact.contactID}
	on:mousedown={() => join(contact)}
	role='none'
>
	{#if contact.logged === true}
		<span>&#149;</span>
	{/if}
  <img src={DIR + selectAvatarURL(contact)} alt={contact.contactID}>
  <div>
		<p class="title" title={contact.name}>{contact.name}</p>
		{#if contact.content}
			<p class="content">
				{#if contact.content instanceof Array}
					{contact.content[0]}
					{:else}
					{contact.content}
				{/if}
			</p>
		{/if}
	</div>
  {#if contact.createdAt}
		<p class="createdAt">
			{getDate(new Date(contact.createdAt))}
		</p>
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

	.title {
		@apply w-full h-5 max-h-5 text-lg font-semibold leading-none;
	}

	.content {
		width: 100%;
		height: 35px;
	}

	.createdAt {
		@apply ml-auto self-start w-16 text-center;
	}
</style>
