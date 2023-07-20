<div class='box-chat'>
	<div>
		<img src="/smiley-main.jpg" alt="smiley placeholder">
		<h2>Welcome!</h2>
	</div>
</div>

<style lang="postcss">
  .box-chat {
		grid-column: 2 / span 1;
		grid-row: 1 / span 3;
		grid-auto-rows: 1fr;
		background-color: #f0f3f3;
		z-index: 50;
		@apply grid relative justify-center items-center w-full h-full overflow-hidden gap-y-px;
	}

	.box-chat div {
		@apply flex flex-wrap w-min h-min;
	}

	img {
		width: 480px;
		height: 480px;
		@apply rounded-full;
	}

	h2 {
		@apply w-full min-h-min text-center text-7xl leading-none;
	}
</style>
