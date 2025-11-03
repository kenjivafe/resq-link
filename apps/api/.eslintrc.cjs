module.exports = {
  root: false,
  extends: ['../../packages/config/eslint/index.cjs'],
  parserOptions: {
    project: __dirname + '/tsconfig.json',
    tsconfigRootDir: __dirname
  },
  ignorePatterns: ['dist/**', 'node_modules/**']
};
