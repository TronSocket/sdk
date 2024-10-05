import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        root: 'tests',
        testTimeout: 30000,
        sequence: {
            concurrent: true
        }
    }
})
