import globals from 'globals'
import pluginJs from '@eslint/js'
import tsEslint from 'typescript-eslint'
import prettierRecommended from 'eslint-plugin-prettier/recommended'

export default [
    {
        ignorePatterns: ['dist/**/*'],
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
    pluginJs.configs.recommended,
    ...tsEslint.configs.recommended
]
