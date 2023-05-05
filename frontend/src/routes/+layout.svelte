<div class="main">
	<slot></slot>
</div>

<style lang='postcss'>
	:global(*) {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
		font-size: 16px;
		font-family: 'Quicksand', Helvetica, monospace;
	}

	:global(a) {
		color: #000000;
		text-decoration: none;
	}

	:global(input, textarea, button) {
		border: none;
		outline: none;
	}

	:global(textarea) {
		resize: none;
	}

	:global(ul, li) {
		list-style-type: none;
	}

	.main {
		background-color: #dffaff;
		@apply grid items-start justify-items-center w-screen h-screen;
	}
</style>
