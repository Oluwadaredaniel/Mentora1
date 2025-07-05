import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; // Import path module

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Correctly resolve '@' alias to your 'src' directory
      // This uses path.resolve to create an absolute path to your src directory.
      '@': path.resolve(__dirname, './src'),
    },
  },s
});
