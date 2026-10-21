import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import remarkSite from './src/plugins/remark-site.mjs';

export default defineConfig({
  integrations: [mdx()],
  markdown: { remarkPlugins: [remarkSite] },
});
