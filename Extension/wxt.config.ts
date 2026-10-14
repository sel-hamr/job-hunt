import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

// See AGENTS.md: smallest permissions only. Never add <all_urls>.
export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-react'],
  // 3000 is the dashboard and 3001 the server, so the dev server takes 3002.
  dev: { server: { port: 3002 } },
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
