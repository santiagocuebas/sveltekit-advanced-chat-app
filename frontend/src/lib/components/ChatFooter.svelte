<script lang="ts">
  import type { IChat } from "$lib/types/global";
  import { getAudiovisuals, getChat } from "$lib/services";
	import { socket } from "$lib/socket";
  import { contact, contacts, options, user } from "$lib/store";
  import { Option, PathIcon } from "$lib/types/enums";

	export let loadChat: (chat: IChat, id: string) => void;
	let message: string;
	let visible = false;

	function handleChat(data: string | string[]) {
		if ($contact) {
			const chat = getChat($user, $contact, data);
			loadChat(chat, $contact.roomID);
			socket.emit('emitChat', data, chat._id);

			if ($contact.type === Option.GROUP) contacts.editGroups($contact.roomID, chat);
		}

		return '';
	}
	
	async function handleDrop(e: DragEvent) {
		visible = true;
		options.resetOptions();

		if (e.dataTransfer) {
			const filenames = await getAudiovisuals(e.dataTransfer.files);
			e.dataTransfer.items.clear();

			if (filenames !== null) handleChat(filenames);
		}

		visible = false;
	}

	async function sendImage(this: HTMLInputElement) {
		visible = true;
		options.resetOptions();

		const filenames = await getAudiovisuals(this.files);

		if (filenames !== null) handleChat(filenames);

		visible = false;
	}
</script>

{#if $options.upload}
	<div class="box-upload">
		<button class="close-window" on:click={() => options.resetOptions()}>
			<i class="fa-solid fa-xmark"></i>
		</button>
		<div>
			<span
				role="none"
				on:dragenter|preventDefault={() => {}}
				on:drop|preventDefault={handleDrop}
				on:dragover|preventDefault={() => {}}
			>
				<svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid">
					<path d={PathIcon.UPLOAD} />
				</svg>
				<p>
					Drag&Drop your files here
				</p>
			</span>
			<button>
				<label>
					Search in Desktop
					<input type="file" on:change|preventDefault={sendImage} multiple>
				</label>
			</button>
		</div>
	</div>
{/if}

<div class="chat-footer">
	<form on:submit|preventDefault={() => message = handleChat(message)}>
		<input type="text" name='message' bind:value={message}>
	</form>
	<button on:click={() => options.setOption(Option.UPLOAD)}>
		<i
			class:spinner={visible}
			class="fa-solid fa-{visible ? 'spinner' : 'arrow-up-from-bracket'}"
		></i>
	</button>
</div>

<style lang="postcss">
	.box-upload {
		grid-column: 2 / span 1;
		grid-row: 1 / span 3;
		@apply flex relative items-center justify-center w-full h-full bg-black/70 z-[300];

		& div {
			@apply flex flex-col items-center justify-between w-3/5 min-w-[280px] max-w-[480px] p-5 bg-white rounded-lg aspect-square;

			& span {
				border: 4px dashed #aaaaaa;
				@apply flex flex-col items-center justify-evenly w-full h-4/5 rounded-3xl;
			}

			& svg {
				@apply w-[100px] fill-[#aaaaaa];
			}

			& p {
				@apply text-center text-[20px] font-semibold text-[#777777];
			}

			& button {
				@apply py-2 px-2.5 bg-[#3d7cf1] rounded;
			}

			& label {
				@apply font-bold text-white leading-tight cursor-pointer;
			}
		}

		& .close-window {
			@apply flex absolute items-center justify-center w-9 h-9 top-2.5 right-2.5 bg-transparent font-bold leading-none;

			& i {
				@apply text-[36px] font-bold text-white;
			}
		}
	}

	.chat-footer {
		grid-column: 2 / span 1;
		grid-row: 3 / span 1;
		@apply flex w-full p-2.5 bg-[#e7e7e7] gap-2.5 [&_form]:w-full;

		& input {
			box-shadow: 0 0 0 1px #999999;
			@apply w-full p-2.5 rounded-sm;
		}

		& button {
			box-shadow: 0 0 0 1px #999999;
			@apply flex flex-none justify-center items-center w-10 h-10 bg-white rounded-full [&_i]:text-[18px];

			& .spinner {
				animation: spin 4s linear infinite;
			}
		}
	}

	@keyframes spin { 
		100% { 
			transform: rotate(360deg); 
		}
	}
</style>
