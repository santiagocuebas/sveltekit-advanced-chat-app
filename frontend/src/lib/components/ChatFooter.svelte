<script lang="ts">
  import type { IChat } from "$lib/types/global";
	import { socket } from "$lib/socket";
  import { editGroups } from '$lib/sockets';
  import { contact, user } from "$lib/store";
  import { getImages } from "$lib/services/libs";
  import { getChat } from "$lib/services/chat-libs";
  import { Option } from "$lib/types/enums";

	export let loadChat: (chat: IChat, id: string) => void;
	let input: HTMLInputElement;

	function handleChat(data: string | string[]) {
		const chat = getChat($user, $contact, data);
		loadChat(chat, $contact.roomID);
		socket.emit('emitChat', data, chat._id);

		if ($contact.type === Option.GROUP) editGroups($contact.roomID, chat);
	}

	function sendMessage(this: HTMLFormElement) {
		const message = new FormData(this).get('message') as string;

		if (message?.length) handleChat(message);

		input.value = '';
	}

	async function sendImage(this: HTMLInputElement) {
		const filenames = await getImages(this.files);

		if (filenames !== null) handleChat(filenames);
	}
</script>

<div>
	<form class="text" on:submit|preventDefault={sendMessage}>
		<input type="text" name='message' bind:this={input}>
	</form>
	<label>
		<i class="fa-solid fa-images"></i>
		<input type="file" on:change|preventDefault={sendImage} multiple>
	</label>
</div>

<style lang="postcss">
	div {
		grid-column: 2 / span 1;
		grid-row: 3 / span 1;
		@apply flex w-full p-2.5 bg-[#e7e7e7] gap-2.5 [&_form]:w-full;

		& input {
			box-shadow: 0 0 0 1px #777777;
			@apply w-full p-2.5 rounded-lg;
		}

		& label {
			background-color: #ffffff;
			box-shadow: 0 0 0 1px #777777;
			@apply flex flex-none justify-center items-center w-10 h-10 bg-white rounded-full cursor-pointer;
		}
	}
</style>
