<script lang="ts">
  export let title: string;
</script>

<div>
	{#if title === 'Loading'}
		<img src="/images.svg" alt="title">
	{/if}
  <h1>{title}</h1>
  <slot />
</div>

<style lang="postcss">
	div {
		grid-auto-rows: min-content;
		grid-column: 1 / span 2;
		grid-row: 1 / span 3;
		@apply grid relative justify-items-center content-center w-full bg-white shadow-grey gap-5;
	}

	img {
		width: 300px;
		height: 300px;
    animation: spin 4s linear infinite;
		@apply rounded-full;
	}

	h1 {
		@apply text-5xl;
	}

	@keyframes spin { 
    100% { 
      transform: rotate(360deg); 
  	}
	}
</style>
