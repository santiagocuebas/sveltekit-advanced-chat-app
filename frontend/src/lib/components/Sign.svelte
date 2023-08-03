<script lang="ts">
  export let title: string;
</script>

<div>
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

	h1 {
		@apply text-4xl;
	}
</style>
