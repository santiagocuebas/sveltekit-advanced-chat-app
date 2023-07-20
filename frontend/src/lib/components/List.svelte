<script lang="ts">
  import { clickOutside } from "$lib/services/out-click";

	export let visible: boolean;
	export let allowed: boolean;

  function showBox() {
		if (allowed) {
			setTimeout(() => {
				visible = true;
				allowed = false;
			}, 0);
		}
	}

	function occultBox() {
		visible = false;
		setTimeout(() => allowed = true, 50);
	}
</script>

<button on:click={showBox}>
  <i class="fa-solid fa-ellipsis-vertical"></i>
</button>
{#if visible}
  <ul use:clickOutside on:outclick={occultBox}>
    <slot></slot>
  </ul>
{/if}

<style lang="postcss">
  button {
		background-color: #e7e7e7;
		@apply p-2.5 ml-auto rounded-full cursor-pointer leading-none;
	}

	button:hover {
		background-color: #cccccc;
	}

	button i {
		@apply w-5 h-5 text-xl leading-none;
	}

	ul {
		background-color: #ffffff;
		box-shadow: 0 0 10px #aaaaaa;
		@apply absolute self-start right-0 mt-11 py-2 rounded;
	}
</style>
