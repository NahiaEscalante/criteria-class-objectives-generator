import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: mode === "development" ? {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        // No mostrar errores si el backend no está disponible
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            // Silenciar errores de proxy cuando el backend no está disponible
            if (req.url?.startsWith('/api')) {
              // No hacer nada - el fetch manejará el error
              return;
            }
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Opcional: agregar timeout
            proxyReq.setTimeout(2000, () => {
              proxyReq.destroy();
            });
          });
        },
      },
    } : undefined,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
