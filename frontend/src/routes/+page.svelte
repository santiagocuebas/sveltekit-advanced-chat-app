<script lang="ts">
	import { onMount } from 'svelte';
  import { contact } from '$lib/store';
  import { PathIcon } from '$lib/types/enums';

	onMount(contact.resetContact);
</script>

<div class="logo">
	<picture>
		<img src="/smiley-main.jpg" alt="smiley placeholder">
	</picture>
	<h2>
		Welcome!
	</h2>
	<ul>
		<li>
			Deployed using the following techs:
		</li>
		<li>
			<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
				<path d={PathIcon.GITHUB} />
			</svg>
			Github
			<a
				href="https://github.com/santiagocuebas/sveltekit-advanced-chat-app"
				target="_blank"
			><i class="fa-solid fa-arrow-up-right-from-square"></i></a>
		</li>
		<li>
			<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
				<path d={PathIcon.NETLIFY} />
			</svg>
			Netlify
		</li>
		<li>
			<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
				<path d={PathIcon.KOYEB} />
			</svg>
			Koyeb
		</li>
		<li>
			<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
				<circle xmlns="http://www.w3.org/2000/svg" cx="512" cy="512" r="512" />
				<path d={PathIcon.MDBATLAS} />
			</svg>
			MongoDB Atlas
		</li>
		<li>
			<svg viewBox="0 -18 120 120" xmlns="http://www.w3.org/2000/svg">
				<g>
					<path d={PathIcon.CLOUDINARY} />
					<path d={PathIcon.LINEONE} />
					<path d={PathIcon.LINETWO} />
					<path d={PathIcon.LINETHREE} />
				</g>
			</svg>
			Cloudinary
		</li>
	</ul>
</div>

<style lang="postcss">
	.logo {
		grid-column: 2 / span 1;
		grid-row: 1 / span 3;
		container-type: size;
		@apply flex flex-col relative items-center justify-center w-full h-full bg-[#f0f3f3] overflow-hidden gap-2.5 z-[50];

		& picture {
			@apply flex-none w-[480px] h-[480px];
		}

		& img {
			@apply w-full h-full rounded-full object-cover;
		}

		& h2 {
			@apply w-full min-h-min text-center font-medium text-6xl leading-none;
		}

		& ul {
			@apply flex flex-none flex-wrap content-start justify-center w-[290px] gap-1.5;
		}

		& svg {
			@apply w-4 h-4 fill-white;
		}

		& li {
			@apply flex items-center py-2 px-3 rounded-md font-semibold text-white gap-1.5;

			&:nth-child(1) {
				@apply p-0 text-[17px] font-medium text-black leading-tight;
			}

			&:nth-child(2) {
				@apply bg-black [&_a]:text-white;
			}

			&:nth-child(3) {
				@apply bg-teal-700;
			}

			&:nth-child(4) {
				@apply bg-[#48c288];
			}

			&:nth-child(5) {
				@apply bg-[#023430] [&_svg]:fill-[#023430] [&_circle]:fill-white;
			}

			&:nth-child(6) {
				@apply bg-[#3448c5];
			}
		}

		@container (width < 500px) or (height < 700px) {
			& picture {
				@apply w-[295px] h-[295px];
			}
		}
	}
</style>
