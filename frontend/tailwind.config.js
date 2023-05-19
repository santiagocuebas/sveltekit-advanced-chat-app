/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {},
    boxShadow: {
      'grey': '0 0 10px #888888',
      'ligthgrey': '0 0 0 1px #aaaaaa',
      'blue': '0 0 0 2px #4b94e7',
      'black': '0 0 0 2px #000000',
    },
    colors : {
      'blue': '#4b94e7',
      'white': '#ffffff',
      'black': '#000000',
      'darkgrey': '#222222'
    }
  },
  plugins: [],
}
