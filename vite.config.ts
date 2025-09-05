import path from 'node:path'
import react from '@vitejs/plugin-react-swc'
import { defineConfig, createLogger } from 'vite'

// === Handlers (igual que los tuyos) ===
const configHorizonsViteErrorHandler = `/* …igual que antes… */`
const configHorizonsRuntimeErrorHandler = `/* …igual que antes… */`
const configHorizonsConsoleErrroHandler = `/* …igual que antes… */`
const configWindowFetchMonkeyPatch = `/* …igual que antes… */`

const addTransformIndexHtml = {
  name: 'add-transform-index-html',
  transformIndexHtml(html) {
    return {
      html,
      tags: [
        { tag: 'script', attrs: { type: 'module' }, children: configHorizonsRuntimeErrorHandler, injectTo: 'head' },
        { tag: 'script', attrs: { type: 'module' }, children: configHorizonsViteErrorHandler, injectTo: 'head' },
        { tag: 'script', attrs: { type: 'module' }, children: configHorizonsConsoleErrroHandler, injectTo: 'head' },
        { tag: 'script', attrs: { type: 'module' }, children: configWindowFetchMonkeyPatch, injectTo: 'head' },
      ],
    }
  },
}

// silenciar warn postcss que ya tenías
console.warn = () => {}
const logger = createLogger()
const loggerError = logger.error
logger.error = (msg, options) => {
  if (options?.error?.toString().includes('CssSyntaxError: [postcss]')) return
  loggerError(msg, options)
}

// CONFIG FINAL (sin plugins inexistentes)
export default defineConfig(({ mode, command }) => {
  const isDev = mode === 'development' || command === 'serve'
  return {
    customLogger: logger,
    plugins: [
      react(),
      addTransformIndexHtml,
    ],
    server: {
      cors: true,
      headers: { 'Cross-Origin-Embedder-Policy': 'credentialless' },
      allowedHosts: true,
    },
    resolve: {
      extensions: ['.jsx', '.js', '.tsx', '.ts', '.json'],
      alias: { '@': path.resolve(__dirname, './src') },
    },
    define: {
      // NO forzamos NODE_ENV a "development"
      'process.env': {},

      // tus flags si las usas:
      'process.env.ENABLE_REAL_DATA': JSON.stringify('true'),
      'process.env.ENABLE_SIMULATION': JSON.stringify('false'),
      'process.env.USE_DEV_SIMULATOR': JSON.stringify('false'),

      'import.meta.env.VITE_ENABLE_REAL_DATA': JSON.stringify('true'),
      'import.meta.env.VITE_ENABLE_SIMULATION': JSON.stringify('false'),
      'import.meta.env.VITE_USE_DEV_SIMULATOR': JSON.stringify('false'),
    },
    build: {
      sourcemap: false,
      rollupOptions: {
        external: [
          '@babel/parser',
          '@babel/traverse',
          '@babel/generator',
          '@babel/types',
        ],
      },
    },
  }
})
