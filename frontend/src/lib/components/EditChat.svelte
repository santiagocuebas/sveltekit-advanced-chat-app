<script lang="ts">
	export let visible: boolean;
	export let option: string | null = null;
	export let handle: any;

	function selectFunction() {
		if (option) return handle(option);
		return handle();
	}
</script>

<div class='edit'>
	<div>
		<slot></slot>
		<button on:click={selectFunction}>
			Accept
		</button>
		<button class="red" on:click={() => visible = false}>
			Cancel
		</button>
	</div>
</div>

<style lang="postcss">
	.edit {
		grid-column: 2 / span 1;
		grid-row: 1 / span 3;
		background-color: #00000099;
		z-index: 300;
		@apply flex absolute items-start justify-center w-full h-full;
	}

	.edit div {
		width: 300px;
		margin-top: 180px;
		background-color: #ffffff;
		box-shadow: 0 0 0 1px #e7e7e7;
		row-gap: 10px;
		@apply flex flex-wrap justify-around p-5 rounded-2xl;
	}
	
	button {
		max-width: 100px;
		background-color: #343fd4;
		color: #ffffff;
		@apply flex justify-center py-2 px-6 rounded text-xl font-bold leading-none cursor-pointer;
	}

	.red {
		background-color: #df2c2c;
	}
</style>
