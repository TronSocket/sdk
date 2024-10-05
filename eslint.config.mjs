import globals from 'globals'
import pluginJs from '@eslint/js'
import tsEslint from 'typescript-eslint'
import jestEslint from 'eslint-plugin-jest'
import prettierRecommended from 'eslint-plugin-prettier/recommended'

export default [
    {
        env: {
            node: true,
            jest: true
        },
        files: ['src/**/*.ts'],
        rules: {
            semi: ['error', 'never'],
            'eol-last': ['error', 'always'],
            'no-multiple-empty-lines': [2, { max: 1 }],
            '@typescript-eslint/explicit-function-return-type': 'error'
        },
        languageOptions: {
            globals: globals.browser
        }
    },
    prettierRecommended,
    jestEslint.recommended,
    pluginJs.configs.recommended,
    ...tsEslint.configs.recommended
]
