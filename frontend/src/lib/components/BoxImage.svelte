<script lang="ts">
  export let img: boolean;
  export let src: string;
  export let alt: string;
</script>

<div>
	<button on:click={() => img = false}>
		<i class="fa-solid fa-xmark"></i>
	</button>
  <img src={src} alt={alt}>
</div>

<style lang="postcss">
  div {
    grid-column: 2 / span 1;
    grid-row: 2 / span 1;
    background-color: #000000;
    z-index: 500;
    @apply grid content-center justify-center w-full h-full;
  }

	button {
		margin-top: 10px;
    background-color: transparent;
		@apply justify-self-end flex fixed items-center justify-center w-9 h-9 mt-2.5 mr-2.5 font-bold leading-none;
	}

	button i {
		color: #ffffff;
		@apply text-4xl font-bold leading-none cursor-pointer;
	}

  img {
    max-height: 770px;
    @apply w-full;
  }
</style>
