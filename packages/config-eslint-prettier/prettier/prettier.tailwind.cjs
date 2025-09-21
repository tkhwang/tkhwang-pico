const base = require('./prettier.base.cjs');

module.exports = {
  ...base,
  plugins: ['prettier-plugin-tailwindcss'],
  tailwindFunctions: ['cva'],
};
