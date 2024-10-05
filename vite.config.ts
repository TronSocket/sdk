import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
    plugins: [
        nodePolyfills()
    ],
    build: {
        minify: true,
        sourcemap: true,
        lib: {
            name: 'TronSocket',
            formats: ['es', 'umd'],
            entry: './src/main.ts',
            fileName: (format: string) => `main.${format}.js`
        }
    }
})
