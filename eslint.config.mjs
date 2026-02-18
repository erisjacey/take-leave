import tseslint from 'typescript-eslint'
import eslintConfigPrettier from 'eslint-config-prettier'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import reactPlugin from 'eslint-plugin-react'
import nextPlugin from '@next/eslint-plugin-next'

export default [
  {
    ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts'],
  },
  ...tseslint.configs.strictTypeChecked,
  {
    plugins: {
      'react-hooks': reactHooksPlugin,
      react: reactPlugin,
      '@next/next': nextPlugin,
    },
    rules: {
      // --- Hooks ---
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // --- Arrow functions only ---
      'func-style': ['error', 'expression'],
      'react/function-component-definition': [
        'error',
        {
          namedComponents: 'arrow-function',
          unnamedComponents: 'arrow-function',
        },
      ],

      // --- Next.js ---
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
    },
  },
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ['*.mjs'],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  eslintConfigPrettier,
]
