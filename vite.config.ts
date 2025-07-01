// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react-swc";
// import path from "path";
// import { componentTagger } from "lovable-tagger";

// // https://vitejs.dev/config/
// export default defineConfig(({ mode }) => ({
//   server: {
//     host: "::",
//     port: 8080,
//   },
//   plugins: [
//     react(),
//     mode === 'development' &&
//     componentTagger(),
//   ].filter(Boolean),
//   resolve: {
//     alias: {
//       "@": path.resolve(__dirname, "./src"),
//     },
//   },
// }));
 
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/socket.io': {
        target: 'https://localhost:3001', // Porta do seu servidor Socket.io
        ws: true, // Importante para WebSocket
        changeOrigin: true,
        secure: false, // Para desenvolvimento local
        rewrite: (path) => path.replace(/^\/socket.io/, ''),
         headers: {
          Connection: "Upgrade",
          Upgrade: "websocket"
        }
      },
      '/api': {
        target: 'http://localhost:3001', // Ou a porta do seu backend API
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }

  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    mode === 'production' && visualizer({
      open: true,
      filename: "dist/stats.html",
      gzipSize: true,
      brotliSize: true,
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // manualChunks: {
        //   react: ['react', 'react-dom', 'react-router-dom'],
        //   ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        //   vendor: ['lodash', 'axios', 'date-fns'],
        //   socket: ['socket.io-client'],
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('socket.io-client')) {
              return 'socket';
            }
            if (id.includes('react')) {
              return 'react';
            }
            if (id.includes('@radix-ui')) {
              return 'ui';
            }
            return 'vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: ['react', 
              'react-dom', 
              'react-router-dom',
              'socket.io-client'
              ],
              exclude: [''],
  },
}));