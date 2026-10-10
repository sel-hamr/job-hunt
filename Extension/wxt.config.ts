import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

// See AGENTS.md: smallest permissions only. Never add <all_urls>.
export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-react'],
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  manifest: {
    name: 'Job Hunt Prompt',
    description: 'Turns the job page I have open into one prompt to copy.',
    permissions: ['activeTab', 'scripting', 'storage'],
    host_permissions: ['https://api.anthropic.com/*'],
  },
});
