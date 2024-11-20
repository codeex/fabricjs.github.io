/** @type {import('tailwindcss').Config} */
import defaultTheme from 'tailwindcss/defaultTheme';
import starlightPlugin from '@astrojs/starlight-tailwind';

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			fontFamily: {
				sans: ['LXGW WenKai', ...defaultTheme.fontFamily.sans],
				serif: [
					...defaultTheme.fontFamily.serif,
					'Microsoft YaHei',
					'宋体',
					'simsun',
				],
				mono: ['LXGW WenKai Mono', ...defaultTheme.fontFamily.mono],
			},
		},
	},
	plugins: [require('@tailwindcss/typography'), starlightPlugin()],
};
