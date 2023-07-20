<script lang="ts">
  import type { IList } from "$lib/global";
	import { DIR } from '$lib/config.js';
  import { socket } from "$lib/socket";

  export let contact: IList;

	function createRoom() {
		if (typeof contact.logged !== 'boolean') socket.emit('joinGroup', contact.id);
		else socket.emit('joinUser', contact.id);
	}
</script>

<li>
  <img src={DIR + '/uploads/avatar/' + contact.avatar} alt={contact.id}>
  <p class="title" title={contact.name}>{contact.name}</p>
  {#if contact.description}
    <p class="content">{contact.description}</p>
  {/if}
	<div>
		<button on:click={createRoom}>
			Join
		</button>
	</div>
</li>

<style lang="postcss">
  li {
		grid-template-columns: min-content 1fr min-content;
		grid-auto-rows: 50%;
		border-bottom: 2px solid #999999;
		@apply grid items-center w-full p-3 font-medium gap-x-1.5;
	}

	img {
		grid-row: 1 / span 2;
		@apply w-16 h-16;
	}

	p {
		@apply overflow-hidden break-words;
	}

	.title {
		@apply h-5 text-lg font-semibold leading-none;
	}

	.content {
		height: 35px;
	}

	div {
		grid-column: 3 / span 1;
		grid-row: 1 / span 2;
	}

	button {
		border-radius: 16px;
		background-color: #3d7cf1;
		color: #ffffff;
		@apply px-4 py-2 text-xl font-bold leading-none cursor-pointer;
	}
</style>
