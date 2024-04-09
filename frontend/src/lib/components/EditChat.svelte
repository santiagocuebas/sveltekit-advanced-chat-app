<script lang="ts">
  import { options } from "$lib/store";
</script>

<div class='edit'>
	<div>
		<slot></slot>
		<button on:click>
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
		@apply flex absolute items-center justify-center w-full h-full bg-black/70 select-none z-[300];

		& div {
			@apply flex flex-wrap justify-around w-1/2 min-w-[280px] max-w-[400px] p-5 bg-white rounded gap-y-2.5;
		}
	}
	
	button {
		@apply flex justify-center w-full max-w-28 py-1.5 bg-[#343fd4] rounded-sm text-[20px] font-bold text-white leading-tight [&.red]:bg-[#df2c2c];
	}
</style>
