const { defineConfig } = require('cypress')

module.exports = defineConfig({
  projectId: 'eyfz9h',
  e2e: {
    baseUrl: 'https://notes-serverless-app.com',
    defaultCommandTimeout: 10000,
    requestTimeout: 15000,
    chromeWebSecurity: false,
    env: {
      viewportWidthBreakpoint: 768,
    },
  },
})