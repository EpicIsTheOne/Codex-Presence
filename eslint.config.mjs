import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {ignores:['dist','release','node_modules','scripts','website']},
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files:['src/**/*.ts'],
    rules:{'@typescript-eslint/no-explicit-any':'off','@typescript-eslint/no-unused-vars':'off','prefer-const':'off','no-empty':'off'},
  },
  {
    files:['*.cjs'],
    languageOptions:{globals:{require:'readonly',module:'readonly',__dirname:'readonly'}},
    rules:{'@typescript-eslint/no-require-imports':'off'},
  },
);
