/* eslint-env node */

/**
 * @typedef {{ plugins: Record<string, unknown> }} PostcssConfig
 */

/** @type {PostcssConfig} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
};

module.exports = config;
