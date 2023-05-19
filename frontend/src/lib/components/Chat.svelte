<script lang="ts">
  import type { IUser } from "$lib/global";
  import { DIR } from "$lib/config";

  export let user: IUser;
</script>

<div class="contact">
  <img src={DIR + '/uploads/avatar/' + user.avatar} alt={user.username}>
  <p>{user.username}</p>
</div>
<div class="chats"></div>
<div class="message">
  <input type="text">
</div>

<style lang="postcss">
  div {
    @apply w-full;
  }

  .contact, .message {
    background-color: #e7e7e7;
    @apply p-2.5;
  }

  .contact {
    @apply flex items-center gap-2.5;
  }

  .contact p {
    @apply text-xl font-semibold leading-none;
  }

  img {
    @apply w-10 h-10;
  }

  .chats {
    background-image: url('/smiley.jpg');
    @apply h-full bg-no-repeat bg-cover;
  }

  .message input {
    box-shadow: 0 0 0 1px #777777;
    @apply w-full p-2.5 rounded-lg;
  }
</style>
