import typescript from '@rollup/plugin-typescript'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser'

export default {
    input: 'src/main.ts',
    output: [
        {
            file: 'dist/main.umd.js',
            format: 'umd',
            name: 'TronSocket',
            plugins: [terser()]
        },
        {
            file: 'dist/main.es.js',
            format: 'es'
        },
        {
            file: 'dist/main.cjs',
            format: 'cjs'
        }
    ],
    plugins: [typescript({ tsconfig: './tsconfig.json' }), resolve(), commonjs()]
}
