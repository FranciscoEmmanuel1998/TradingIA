import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // Proxy para resolver CORS de KuCoin
      '/api/kucoin': {
        target: 'https://api.kucoin.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/kucoin/, ''),
        secure: true,
        headers: {
          'Origin': 'https://api.kucoin.com'
        }
      }
    }
  },
  define: {
    // Definir variables de entorno para el navegador - FASE IA 2: SOLO DATOS REALES
    'process.env': {},
    'process.env.NODE_ENV': JSON.stringify(mode),
    'process.env.ENABLE_REAL_DATA': JSON.stringify('true'), // FORZAR DATOS REALES
    'process.env.ENABLE_SIMULATION': JSON.stringify('false'), // ELIMINAR SIMULACIÓN
    'process.env.USE_DEV_SIMULATOR': JSON.stringify('false'), // NO MÁS SIMULADORES
    // También como variables de Vite para mayor compatibilidad
    'import.meta.env.VITE_ENABLE_REAL_DATA': JSON.stringify('true'),
    'import.meta.env.VITE_ENABLE_SIMULATION': JSON.stringify('false'),
    'import.meta.env.VITE_USE_DEV_SIMULATOR': JSON.stringify('false'),
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
