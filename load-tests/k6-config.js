/**
 * K6 Load Testing Configuration
 * 
 * This file contains shared configuration for all K6 load test scripts.
 * 
 * BASE URLs:
 * - E2E Testing (Playwright): https://www.saucedemo.com (configured in playwright.config.ts)
 * - Load Testing (K6): https://jsonplaceholder.typicode.com (this file)
 * 
 * Reference: See playwright.config.ts for E2E base URL documentation
 */

// Base URL for K6 Performance/Load Testing
// This matches BASE_URL2 in utils/constants.ts
export const BASE_URL = "https://jsonplaceholder.typicode.com";

