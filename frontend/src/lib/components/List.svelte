<script lang="ts">
  import { clickOutside } from "$lib/services/out-click";

	export let visible: boolean;
</script>

<button on:click={() => visible = true}>
  <i class="fa-solid fa-ellipsis-vertical"></i>
</button>
{#if visible}
  <ul use:clickOutside on:outclick={setTimeout(() => visible = false)}>
    <slot></slot>
  </ul>
{/if}

<style lang="postcss">
  button {
		background-color: #e7e7e7;
		@apply ml-auto p-2.5 rounded-full cursor-pointer leading-none;
	}

	button:hover {
		background-color: #cccccc;
	}

	button i {
		@apply w-5 h-5 text-xl leading-none;
	}

	ul {
		min-width: 150px;
		background-color: #ffffff;
		box-shadow: 0 0 10px #aaaaaa;
		z-index: 1000;
		@apply absolute self-start right-0 mt-11 py-2 rounded;
	}
</style>
