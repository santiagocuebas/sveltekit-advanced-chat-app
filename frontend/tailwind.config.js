/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {},
    boxShadow: {
      'grey': '0 0 10px #888888'
    },
    colors : {
      'blue': '#4b94e7',
      'white': '#ffffff'
    }
  },
  plugins: [],
}
