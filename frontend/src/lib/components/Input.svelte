<script lang="ts">
  import type { Check } from "$lib/global";
  import { clickOutside } from "$lib/services/out-click";
  import { afterUpdate } from "svelte";

	export let text: string;
	export let name: string;
	export let input: string;
	export let error: string | undefined;
	export let pass: string | undefined;
	export let active: boolean;
	export let check: Check;

	let selectClass = { label: '', paragraph: '', input: '' };

	const changeClass = () => {
		error = undefined;
		selectClass = {
			label: 'focus-label',
			paragraph: 'focus-p',
			input: 'visible-input'
		};
	};

	const changeError = () => {
		if (name === 'confirmPassword') error = check(input, error, pass);
		else error = check(input, error);

		if (error) {
			selectClass.label = 'error-label';
			selectClass.paragraph = 'error-p';
		}

		if (!error && !input.length) {
			selectClass = {
				label: '',
				paragraph: '',
				input: ''
			};
		}
	};

	function setInput(this: HTMLInputElement) {
		return input = this.value;
	}

	const setType = () => {
		if (name === 'username' || name === 'email') return 'text';
		return 'password';
	};

	afterUpdate(() => {
		if (active) {
			selectClass.label = 'error-label';
			selectClass.paragraph = 'error-p';
			active = false;
		};
	})
</script>

<div>
	<label
		class={selectClass.label}
		use:clickOutside
		on:mousedown={changeClass}
		on:outclick={changeError}
	>
		<p class={selectClass.paragraph}>
			{text}
		</p>
		<input
			class={selectClass.input}
			type={setType()}
			name={name}
			value={input}
			autocomplete="off"
			on:change={setInput}
		>
	</label>
	{#if error}
		<div>
			<i class="fa-solid fa-xmark"></i>
			{error}
		</div>
	{/if}
</div>

<style lang="postcss">
	div {
		@apply w-full;
	}

	label {
		transition: all 0.5s;
		gap: 5px;
		@apply flex flex-wrap w-full h-14 p-2 rounded shadow-ligthgrey;
	}

	p {
		transition: all 0.5s;
		@apply w-full text-darkgrey text-xl font-normal leading-loose select-none;
	}

	input {
		transition: all 0s;
		@apply h-0 w-full;
	}

	div div {
		color: #df3c3c;
		@apply flex items-center w-full pl-2.5 py-0.5 font-bold gap-1;
	}

	div i {
		@apply self-start text-xl leading-tight;
	}

	.focus-label {
		box-shadow: 0 0 0 2px #4288d8;
	}

	.focus-p {
		font-size: 14px;
		line-height: 1.071;
		color: #4288d8;
		@apply font-semibold;
	}

	.visible-input {
		height: 20px;
		transition-delay: 0.5s;
	}

	.error-label {
		box-shadow: 0 0 0 2px #df3c3c;
		@apply flex-wrap;
	}

	.error-p {
		font-size: 14px;
		line-height: 1.071;
		color: #df3c3c;
		@apply font-semibold;
	}
</style>
