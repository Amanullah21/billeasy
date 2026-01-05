/**
 * Constants used across the test framework
 */

export const BASE_URL = 'https://www.saucedemo.com';

// Timeouts
export const TIMEOUTS = {
  SHORT: 5000,
  MEDIUM: 10000,
  LONG: 30000,
  VERY_LONG: 60000,
};

// Common selectors
export const SELECTORS = {
  // Header
  HEADER: 'header',
  LOGO: '.logo',
  MENU: '.navbar-nav',
  
  // Footer
  FOOTER: 'footer',
  
  // Common buttons
  SUBMIT_BUTTON: 'button[type="submit"]',
  CLOSE_BUTTON: '.close',
};

// Test data paths
export const TEST_DATA_PATHS = {
  LOGIN: './fixtures/test-data.json',
};

// Browser configurations
export const BROWSERS = {
  CHROMIUM: 'chromium',
  FIREFOX: 'firefox',
};

// Report paths
export const REPORT_PATHS = {
  HTML: 'reports/html-report/index.html',
  JSON: 'reports/test-results.json',
};




