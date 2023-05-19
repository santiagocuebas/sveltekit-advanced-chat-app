<div class="main">
	<div></div>
	<slot />
</div>

<style lang='postcss'>
	:global(*) {
		box-sizing: border-box;
		font-family: 'Quicksand', Helvetica, monospace;
		@apply m-0 p-0 text-base leading-none;
	}

	:global(a) {
		color: #000000;
		text-decoration: none;
	}

	:global(input, textarea, button) {
		border: none;
		outline: none;
		background-color: #ffffff;
	}

	:global(textarea) {
		resize: none;
	}

	:global(ul, li) {
		list-style-type: none;
	}

	:global(.main) {
		padding: 27.5px 35px;
		background-color: #000000;
		@apply grid relative items-start justify-items-center w-full min-h-screen;
	}

	.main div {
		background-color: #3d7cf1;
		@apply absolute w-full h-1/2;
	}
</style>
