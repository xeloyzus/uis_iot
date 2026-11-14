import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
export default defineConfig({
    plugins: [vue()],
    // Relative assets make this build work on GitHub Pages project sites
    // without hard-coding the repository name.
    base: './',
});
