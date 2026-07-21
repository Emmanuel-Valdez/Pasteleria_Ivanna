/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				cream: '#FAF6EC',
				cocoa: '#4A2E1E',
				rose: '#D88C9A',
				gold: '#C9A227',
				whatsapp: '#25D366',
			},
			fontFamily: {
				script: ['"Playfair Display"', 'serif'],
			},
		},
	},
	plugins: [],
}
