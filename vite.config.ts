import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      // 1. Move 'base' here (Root level)
      base: '/simpletbcalc/', 

      server: {
        port: 3000,
        host: '0.0.0.0',
      },

      // 2. Remove 'base' from the plugins array
      plugins: [
        react()
      ],

      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
