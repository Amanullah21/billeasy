# E2E Testing & Load Testing Framework

A comprehensive test automation framework built with Playwright (TypeScript) for E2E testing and K6 for load testing. This framework follows the Page Object Model (POM) pattern and includes scalable folder structure, cross-browser testing, performance testing, and comprehensive security testing capabilities.

## Table of Contents

- [Tech Stack](#tech-stack)
- [AI Tool Used](#ai-tool-used)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Project Structure](#project-structure)
- [Quick Reference - All Commands](#quick-reference---all-commands)
- [Running Tests](#running-tests)
- [Load Testing](#load-testing)
- [Test Reports](#test-reports)
- [Troubleshooting](#troubleshooting)
- [Application Under Test](#application-under-test)
- [Security Testing](#security-testing)
- [Contributing](#contributing)

## Tech Stack

- **Playwright**: E2E testing framework
- **TypeScript**: Programming language
- **K6**: Load testing tool
- **Node.js**: Runtime environment
- **npm**: Package manager

## AI Tool Used

This project was developed using **Cursor** AI assistant for code generation, structure planning, and implementation guidance.

## Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)
- K6 (for load testing) - See [K6 Installation](#k6-installation)

## Installation & Setup

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd billeasy
```

### Step 2: Install Node.js Dependencies

```bash
npm install
```

### Step 3: Install Playwright Browsers

```bash
npx playwright install --with-deps chromium firefox
```

**Note**: This installs Chromium and Firefox browsers with all system dependencies required for Playwright.

### Step 4: Install K6 (Load Testing Tool)

**macOS:**

```bash
brew install k6
```

**Linux:**

```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D9B
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

**Windows:**
Download installer from: https://k6.io/docs/getting-started/installation/

### Step 5: Verify Installation

```bash
# Verify Node.js and npm
node --version    # Should be v16 or higher
npm --version     # Should be v7 or higher

# Verify Playwright
npx playwright --version

# Verify K6 (after installation)
k6 version
```

### Step 6: Run Your First Test

```bash
# Run E2E tests
npm test

# Run load tests
npm run load-test:quick
npm run load-test:all            # Run all 11 K6 test scripts (~10-15 min)

```

## Project Structure

```
billeasy/
├── tests/
│   ├── e2e/                    # E2E test specifications
│   │   ├── login.spec.ts
│   │   ├── navigation.spec.ts
│   │   ├── form-submission.spec.ts
│   │   ├── checkout-flow.spec.ts
│   │   ├── error-handling.spec.ts
│   │   └── security.spec.ts    # Security tests (SQL injection, XSS, brute force, etc.)
├── pages/                      # Page Object Model classes
│   ├── BasePage.ts            # Base page with common methods
│   ├── LoginPage.ts
│   ├── HomePage.ts
│   ├── ProductPage.ts
│   ├── CartPage.ts
│   └── CheckoutPage.ts
├── fixtures/                   # Test data
│   └── test-data.json
├── utils/                      # Utility functions
│   ├── helpers.ts
│   └── constants.ts
├── load-tests/                 # Load testing scripts
│   ├── k6-config.js           # K6 base URL configuration (shared by all scripts)
│   ├── k6-scripts/
│   │   ├── 01-load-test.js
│   │   ├── 02-stress-test.js
│   │   ├── 03-spike-test.js
│   │   ├── 04-soak-test.js
│   │   ├── 05-scalability-test.js
│   │   ├── 06-crud-operations-test.js
│   │   ├── 07-error-handling-test.js
│   │   ├── 08-concurrent-requests-test.js
│   │   ├── 09-volume-test.js
│   │   ├── 10-performance-benchmark-test.js
│   │   └── api-load-test.js
│   ├── run-all-tests.sh        # Script to run all K6 tests
│   ├── README.md               # Complete K6 load testing guide
│   ├── FAST-TESTING-CONFIG.md  # Fast testing configuration guide
│   └── RUN-ALL-K6-TESTS.md     # Running all tests guide
├── reports/                    # Test reports and screenshots
│   └── .gitkeep
├── playwright.config.ts       # Playwright configuration
├── package.json
├── tsconfig.json
├── .gitignore
└── README.md
```

## Quick Reference - All Commands

### E2E Testing (Playwright)

#### Run All Tests

```bash
npm test                          # Run all tests (headless mode - default)
npm run test:headed              # Run all tests (headed mode - see browser)
npm run test:chrome              # Run all tests in Chrome only
npm run test:firefox             # Run all tests in Firefox only
npm run test:debug               # Run all tests in debug mode
npm run test:ui                   # Run all tests in interactive UI mode
npm run test:report               # View HTML test report
```

#### Run Specific Test Files

```bash
npx playwright test tests/e2e/login.spec.ts
npx playwright test tests/e2e/navigation.spec.ts
npx playwright test tests/e2e/form-submission.spec.ts
npx playwright test tests/e2e/checkout-flow.spec.ts
npx playwright test tests/e2e/error-handling.spec.ts
npx playwright test tests/e2e/security.spec.ts
```

#### Run Security Tests

```bash
# Run all security tests
npx playwright test tests/e2e/security.spec.ts

# Run specific security test suites
npx playwright test tests/e2e/security.spec.ts -g "SQL Injection"
npx playwright test tests/e2e/security.spec.ts -g "Brute Force"
npx playwright test tests/e2e/security.spec.ts -g "XSS"
npx playwright test tests/e2e/security.spec.ts -g "Authentication Bypass"
npx playwright test tests/e2e/security.spec.ts -g "Sensitive Data Exposure"
```

#### Advanced Playwright Commands

```bash
# Run with specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox

# Run with timeout override
npx playwright test --timeout=60000

# Run specific test by name
npx playwright test -g "should login"

# Generate test code
npx playwright codegen https://www.saucedemo.com
```

### Load Testing (K6)

#### Quick Start Commands

```bash
npm run load-test:all            # Run all 11 K6 test scripts (~10-15 min)
npm run load-test:quick          # Run first 3 scripts (~3-5 min)
npm run load-test                # Run basic API load test
```

#### Run Individual K6 Tests

```bash
k6 run load-tests/k6-scripts/01-load-test.js              # Normal load
k6 run load-tests/k6-scripts/02-stress-test.js            # Stress test
k6 run load-tests/k6-scripts/03-spike-test.js              # Spike test
k6 run load-tests/k6-scripts/04-soak-test.js              # Soak test
k6 run load-tests/k6-scripts/05-scalability-test.js        # Scalability test
k6 run load-tests/k6-scripts/06-crud-operations-test.js    # CRUD operations
k6 run load-tests/k6-scripts/07-error-handling-test.js    # Error handling
k6 run load-tests/k6-scripts/08-concurrent-requests-test.js  # Concurrent requests
k6 run load-tests/k6-scripts/09-volume-test.js             # Volume test
k6 run load-tests/k6-scripts/10-performance-benchmark-test.js # Benchmark
k6 run load-tests/k6-scripts/api-load-test.js              # Basic API test
```

#### Advanced K6 Commands

```bash
# Run with custom virtual users and duration
k6 run --vus 10 --duration 30s load-tests/k6-scripts/api-load-test.js

# Run with custom stages
k6 run --stage 30s:20 --stage 1m:20 --stage 30s:0 load-tests/k6-scripts/api-load-test.js

# Save results to JSON
k6 run --out json=reports/k6-results.json load-tests/k6-scripts/api-load-test.js

# Run with specific iterations
k6 run --iterations 100 load-tests/k6-scripts/api-load-test.js
```

## Running Tests

### Headless Mode (Default - for CI/CD)

```bash
# Run all tests in headless mode
npx playwright test

# Run specific test file
npx playwright test tests/e2e/login.spec.ts

# Run tests in specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
```

### Headed Mode (for debugging)

```bash
# Run all tests in headed mode
npx playwright test --headed

# Run specific test in headed mode
npx playwright test tests/e2e/login.spec.ts --headed

# Run with UI mode (interactive)
npx playwright test --ui
```

### Other Useful Commands

```bash
# Run tests in debug mode
npx playwright test --debug

# Run tests with specific timeout
npx playwright test --timeout=60000

# Run tests in specific browser
npx playwright test --project=chromium --headed

# Generate code for new test
npx playwright codegen https://www.saucedemo.com
```

### NPM Scripts

All available npm scripts:

```bash
npm test              # Run all E2E tests headless
npm run test:headed   # Run all E2E tests headed
npm run test:chrome   # Run E2E tests in Chrome only
npm run test:firefox  # Run E2E tests in Firefox only
npm run test:debug    # Run E2E tests in debug mode
npm run test:ui       # Run E2E tests in UI mode
npm run test:report   # View HTML test report
npm run load-test     # Run basic K6 API load test
npm run load-test:all # Run all 11 K6 test scripts
npm run load-test:quick # Run first 3 K6 test scripts
```

## Load Testing

Load testing is performed using **K6** (separate from E2E testing with Playwright).

### Quick Start

```bash
# Run all 11 K6 load test scripts (~10-15 minutes)
npm run load-test:all

# Run quick test suite - first 3 scripts (~3-5 minutes)
npm run load-test:quick

# Run basic API load test
npm run load-test
```

### Base URL Configuration

Base URLs are documented in `playwright.config.ts`:

- **E2E Testing**: `https://www.saucedemo.com` (Playwright - configured in `playwright.config.ts`)
- **Load Testing**: `https://jsonplaceholder.typicode.com` (K6 - configured in `load-tests/k6-config.js`)

All K6 scripts import the base URL from `k6-config.js` for centralized configuration.

### Available Test Scripts

The framework includes 11 comprehensive K6 load test scripts covering:

- Load Testing, Stress Testing, Spike Testing
- Soak Testing, Scalability Testing, CRUD Operations
- Error Handling, Concurrent Requests, Volume Testing
- Performance Benchmarking

### Documentation

For detailed load testing documentation, see:

- **[load-tests/README.md](load-tests/README.md)** - Complete K6 load testing guide
- **[load-tests/FAST-TESTING-CONFIG.md](load-tests/FAST-TESTING-CONFIG.md)** - Fast testing configuration
- **[load-tests/RUN-ALL-K6-TESTS.md](load-tests/RUN-ALL-K6-TESTS.md)** - Running all tests guide

**Note**: All scripts are configured for fast testing (5-10 users). See `load-tests/README.md` for full details, individual script documentation, advanced options, and complete load testing theory.

## Test Reports

### HTML Report

After running tests, view the HTML report:

```bash
npx playwright show-report reports/html-report
# or
npm run test:report
```

**Note:** Reports are auto-generated when tests run. The `reports/` directory is excluded from Git (see `.gitignore`) as reports are generated artifacts.

### JSON Report

JSON test results are saved to: `reports/test-results.json`

### Screenshots and Videos

- Screenshots on failure: `reports/screenshots/`
- Videos on failure: `test-results/` (Playwright default location)
- Traces on retry: Available in HTML report

### K6 Reports

K6 test results are saved to: `reports/k6-*-test-summary.json` (one file per test script)
See [load-tests/README.md](load-tests/README.md) for detailed K6 reporting information.

### Report Generation

Reports are automatically generated when you run tests:

- **E2E Tests**: Generate HTML and JSON reports in `reports/` directory
- **K6 Tests**: Generate JSON summary files in `reports/` directory
- Reports are **not committed to Git** (excluded in `.gitignore`)
- Reports are **generated locally** each time tests are run

## Troubleshooting

### Common Issues

#### Tests fail with timeout errors

- Increase timeout in `playwright.config.ts`
- Check network connectivity
- Verify the application is accessible

#### Browser not found

```bash
npx playwright install
```

#### TypeScript compilation errors

```bash
npm install
npx tsc --noEmit
```

#### K6 not found

- Verify K6 installation: `k6 version`
- Follow K6 installation instructions above

#### Tests fail in CI/CD

- Ensure headless mode is enabled
- Check browser dependencies are installed
- Verify environment variables are set

### Debug Tips

1. **Use headed mode** to see what's happening:

   ```bash
   npx playwright test --headed
   ```

2. **Use debug mode** for step-by-step execution:

   ```bash
   npx playwright test --debug
   ```

3. **Use UI mode** for interactive testing:

   ```bash
   npx playwright test --ui
   ```

4. **Check screenshots** in `reports/screenshots/` for failed tests

5. **Review HTML report** for detailed test execution information

## Application Under Test

### E2E Testing Target

This framework tests the **Sauce Demo** website: https://www.saucedemo.com

The website includes:

- User login and authentication
- Product browsing and filtering
- Shopping cart functionality
- Checkout process

**Base URL Configuration:**

- E2E tests use: `https://www.saucedemo.com` (configured in `playwright.config.ts`)
- Test data is stored in `fixtures/test-data.json`

### Load Testing Target

K6 load tests target the **JSONPlaceholder** API: https://jsonplaceholder.typicode.com

This is a free fake REST API for testing and prototyping, perfect for load testing scenarios.

**Base URL Configuration:**

- K6 tests use: `https://jsonplaceholder.typicode.com` (configured in `load-tests/k6-config.js`)
- All K6 scripts import the base URL from the shared config file

## Security Testing

The framework includes comprehensive security tests covering:

### SQL Injection Tests

- Username field SQL injection attempts
- Password field SQL injection attempts
- Checkout form SQL injection attempts

### Brute Force Attack Tests

- Common password dictionary attacks
- Rapid login attempt scenarios
- Rate limiting verification

### XSS (Cross-Site Scripting) Tests

- Username field XSS payloads
- Password field XSS payloads
- Checkout form XSS payloads

### Input Validation Tests

- Extremely long input strings
- Special characters and emojis
- Null/undefined value handling
- SQL-like pattern detection

### Authentication Bypass Tests

- URL manipulation attempts
- Cookie/session hijacking prevention
- Empty credentials validation
- Partial credentials validation

### Path Traversal Tests

- Directory traversal attempts
- System file access prevention

### Session Management Tests

- Session invalidation on logout
- Concurrent session handling

### CSRF Tests

- Cross-Site Request Forgery protection

### Sensitive Data Exposure Tests

- Password field type verification
- Password visibility checks
- URL parameter exposure checks

### Running Security Tests

```bash
# Run all security tests
npm test -- tests/e2e/security.spec.ts

# Run specific security test suite
npm test -- tests/e2e/security.spec.ts -g "SQL Injection"
npm test -- tests/e2e/security.spec.ts -g "Brute Force"
npm test -- tests/e2e/security.spec.ts -g "XSS"
npm test -- tests/e2e/security.spec.ts -g "Authentication Bypass"
npm test -- tests/e2e/security.spec.ts -g "Sensitive Data Exposure"
```

**Note:** Security tests may take longer to run (3+ minutes) due to multiple payload iterations. Timeouts are configured accordingly.

## Contributing

1. Follow the Page Object Model pattern
2. Add new page objects in the `pages/` directory
3. Add test data in `fixtures/test-data.json`
4. Write descriptive test names
5. Include proper assertions
6. Update documentation as needed

## License

ISC
