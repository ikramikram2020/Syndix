import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'

const eslintConfig = defineConfig([
  ...nextVitals,
  {
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
      'react/no-unescaped-entities': 'off',
      '@next/next/no-img-element': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
  globalIgnores([
    '.next/**',
    'out/**', 
    'build/**',
    'node_modules/**',
  ]),
])

export default eslintConfig