import { defineConfig, preview } from 'vite';
import react from '@vitejs/plugin-react';
import reactRefresh from "@vitejs/plugin-react-refresh";
import federation from "@originjs/vite-plugin-federation";
import path from 'path';

// https://vitejs.dev/config/
/**
 * @BEFORE source for pnpm
 * @TODO pnpm build and pnpm serve 
 */
export default defineConfig({
  plugins: [
    react({
      include: '**/*.{jsx, tsx, js, ts}',
      babel: {
        plugins: ['babel-plugin-styled-components'],
      },
    }),
    reactRefresh(),
    federation({
      name: "y-music-host-app",
      filename: "remoteEntry.js",
      remotes: {
        y_music_remote: "http://localhost:5000:/assets/remoteEntry.js" //remote path containing the port configured on remote side, the build path, and the filename also configured on the remote side
      }
    })
  ],
  build: {
    minify: true,
  },
  resolve: {
    alias: {
      stream: 'stream-browserify',
      querystring: 'querystring-browser',
      react: path.resolve('./node_modules/react'),
    },
  },

});