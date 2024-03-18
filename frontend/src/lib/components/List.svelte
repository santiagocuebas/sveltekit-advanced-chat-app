<script lang="ts">
  import { clickOutside } from "$lib/services";

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
		@apply ml-auto p-2.5 bg-[#e7e7e7] rounded-full leading-none hover:bg-[#cccccc];

		& i {
			@apply w-5 h-5 text-xl leading-none;
		}
	}

	ul {
		box-shadow: 0 0 10px #aaaaaa;
		@apply absolute self-start min-w-[150px] right-0 mt-11 py-2 bg-white rounded cursor-default z-[1000];
	}
</style>
