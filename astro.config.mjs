// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://wakeuplee0406.github.io',
  base: '/claude-101',
  integrations: [react(), mdx()],

  vite: {
    plugins: [tailwindcss()]
  }
});