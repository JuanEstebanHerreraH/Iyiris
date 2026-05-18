import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			// Genera todo en /build — listo para Vercel, Netlify, Cloudflare Pages, etc.
			pages: 'build',
			assets: 'build',
			fallback: 'index.html',  // SPA mode: todas las rutas apuntan al index
			precompress: false,
			strict: false
		})
	}
};

export default config;
