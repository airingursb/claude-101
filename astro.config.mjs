// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://claude-101.ursb.me',
  base: '/',
  integrations: [react(), mdx()],

  vite: {
    plugins: [tailwindcss()]
  }
});