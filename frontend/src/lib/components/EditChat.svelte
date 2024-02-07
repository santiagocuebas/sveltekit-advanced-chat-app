<script lang="ts">
  import { options } from "$lib/store";

	export let handle: () => void;
</script>

<div class='edit'>
	<div>
		<slot></slot>
		<button on:click={handle}>
			Accept
		</button>
		<button class="red" on:click={() => options.resetOptions()}>
			Cancel
		</button>
	</div>
</div>

<style lang="postcss">
	.edit {
		grid-column: 2 / span 1;
		grid-row: 1 / span 3;
		@apply flex absolute items-start justify-center w-full h-full bg-black/70 z-[300];

		& div {
			box-shadow: 0 0 0 1px #e7e7e7;
			@apply flex flex-wrap justify-around w-1/2 min-w-[240px] max-w-[400px] mt-[180px] p-5 bg-white rounded-2xl gap-y-2.5;
		}
	}
	
	button {
		@apply flex justify-center max-w-[99px] py-2 px-6 bg-[#343fd4] rounded text-[20px] font-bold text-white [&.red]:bg-[#df2c2c];
	}
</style>
