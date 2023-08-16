<script lang="ts">
  import type { IContact } from "$lib/global";
	import { DIR } from '$lib/config.js';

  export let contact: IContact;
  export let id: string;
  export let join: (value: IContact) => void;
</script>

<li class:selected={id === contact.contactID} on:mousedown={() => join(contact)}>
	{#if contact.logged === true}
		<span>&#149;</span>
	{/if}
  <img src={DIR + '/uploads/avatar/' + contact.avatar} alt={contact.contactID}>
  <div>
		<p class="title" title={contact.name}>{contact.name}</p>
		{#if contact.content}
			<p class="content">{contact.content}</p>
		{/if}
	</div>
  {#if contact.createdAt}
		<p class="createdAt">
			{
				new Date(contact.createdAt).getHours() + ':' +
				new Date(contact.createdAt).getMinutes()
			}
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
		@apply w-16 h-16 rounded-full;
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
