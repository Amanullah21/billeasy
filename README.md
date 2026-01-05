# E2E Testing & Load Testing Framework

A comprehensive test automation framework built with Playwright (TypeScript) for E2E testing and K6 for load testing. This framework follows the Page Object Model (POM) pattern and includes scalable folder structure, cross-browser testing, and performance testing capabilities.

## Table of Contents

- [Tech Stack](#tech-stack)
- [AI Tool Used](#ai-tool-used)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Project Structure](#project-structure)
- [Running Tests](#running-tests)
- [Load Testing](#load-testing)
- [Load Testing Theory](#load-testing-theory)
- [Test Reports](#test-reports)
- [Troubleshooting](#troubleshooting)

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

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd billeasy
```

2. Install dependencies:
```bash
npm install
```

3. Install Playwright browsers:
```bash
npx playwright install --with-deps chromium firefox
```

### K6 Installation

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

## Project Structure

```
billeasy/
├── tests/
│   ├── e2e/                    # E2E test specifications
│   │   ├── login.spec.ts
│   │   ├── navigation.spec.ts
│   │   ├── form-submission.spec.ts
│   │   ├── checkout-flow.spec.ts
│   │   └── error-handling.spec.ts
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
│   ├── k6-scripts/
│   │   └── api-load-test.js
│   └── README.md
├── reports/                    # Test reports and screenshots
│   └── .gitkeep
├── playwright.config.ts       # Playwright configuration
├── package.json
├── tsconfig.json
├── .gitignore
└── README.md
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
npx playwright codegen https://automationexercise.com
```

### NPM Scripts

Add these to your `package.json`:

```json
{
  "scripts": {
    "test": "playwright test",
    "test:headed": "playwright test --headed",
    "test:chrome": "playwright test --project=chromium",
    "test:firefox": "playwright test --project=firefox",
    "test:debug": "playwright test --debug",
    "test:ui": "playwright test --ui"
  }
}
```

Then run:
```bash
npm test              # Run all tests headless
npm run test:headed   # Run all tests headed
npm run test:chrome   # Run tests in Chrome only
```

## Load Testing

### Running K6 Load Tests

```bash
# Basic execution
k6 run load-tests/k6-scripts/api-load-test.js

# With custom virtual users and duration
k6 run --vus 10 --duration 30s load-tests/k6-scripts/api-load-test.js

# With custom stages
k6 run --stage 30s:20 --stage 1m:20 --stage 30s:0 load-tests/k6-scripts/api-load-test.js

# Save results to JSON
k6 run --out json=reports/k6-results.json load-tests/k6-scripts/api-load-test.js
```

### Understanding K6 Results

The load test script includes:
- **Virtual Users (VUs)**: Number of concurrent users
- **Ramp-up**: Gradual increase in load
- **Response Time Metrics**: Average, P95, P99
- **Error Rate**: Percentage of failed requests
- **Throughput**: Requests per second

## Load Testing Theory

### Types of Load Testing

#### 1. Load Testing
**Definition**: Testing the system's behavior under expected normal load conditions.

**Purpose**: 
- Verify system performance under normal conditions
- Identify performance bottlenecks
- Validate response times meet requirements

**When to Use**:
- Before production deployment
- After major code changes
- Regular performance regression testing
- Capacity planning

**Example Scenario**: Simulate 100 concurrent users accessing an e-commerce site during normal business hours.

---

#### 2. Stress Testing
**Definition**: Testing the system beyond its normal operational capacity to find breaking points.

**Purpose**:
- Determine maximum capacity
- Identify system failure points
- Test system recovery mechanisms
- Understand behavior under extreme conditions

**When to Use**:
- Before high-traffic events (sales, launches)
- To determine scalability limits
- To test system resilience
- Capacity planning for peak loads

**Example Scenario**: Gradually increase load from 100 to 1000 users to find when the system starts failing.

---

#### 3. Spike Testing
**Definition**: Testing the system's response to sudden, dramatic increases in load.

**Purpose**:
- Verify system can handle sudden traffic spikes
- Test auto-scaling mechanisms
- Identify resource allocation issues
- Validate error handling under sudden load

**When to Use**:
- Testing flash sale scenarios
- Validating auto-scaling configurations
- Testing viral content scenarios
- Preparing for marketing campaigns

**Example Scenario**: Instantly increase from 50 to 500 users, then back to 50.

---

#### 4. Soak/Endurance Testing
**Definition**: Testing the system under sustained load for extended periods.

**Purpose**:
- Identify memory leaks
- Detect resource exhaustion
- Find performance degradation over time
- Validate system stability

**When to Use**:
- Before long-running production deployments
- Testing for memory leaks
- Validating resource management
- Ensuring system stability over time

**Example Scenario**: Run 100 concurrent users for 8 hours continuously.

---

#### 5. Scalability Testing
**Definition**: Testing the system's ability to scale up or down based on demand.

**Purpose**:
- Validate horizontal/vertical scaling
- Test load balancing
- Verify auto-scaling mechanisms
- Plan infrastructure growth

**When to Use**:
- Testing cloud infrastructure
- Validating microservices architecture
- Planning infrastructure capacity
- Testing container orchestration (Kubernetes, Docker Swarm)

**Example Scenario**: Gradually increase load and verify system automatically scales resources.

---

### Key Metrics to Monitor

#### Response Time Metrics
- **Average Response Time**: Mean time for all requests
- **P95 (95th Percentile)**: 95% of requests complete within this time
- **P99 (99th Percentile)**: 99% of requests complete within this time
- **Min/Max Response Time**: Fastest and slowest request times

**Why Important**: 
- User experience directly correlates with response time
- P95/P99 help identify outliers affecting user experience
- Industry standard: P95 < 500ms for good UX

#### Throughput
- **Requests per Second (RPS)**: Number of requests processed per second
- **Transactions per Second (TPS)**: Number of transactions completed per second

**Why Important**:
- Measures system capacity
- Helps with capacity planning
- Identifies bottlenecks

#### Error Rate
- **HTTP Error Rate**: Percentage of requests returning error status codes (4xx, 5xx)
- **Failed Requests**: Total number of failed requests

**Why Important**:
- Indicates system health
- Helps identify breaking points
- Critical for SLA compliance

#### Resource Utilization
- **CPU Usage**: Processor utilization percentage
- **Memory Usage**: RAM consumption
- **Network I/O**: Network bandwidth usage
- **Database Connections**: Active database connections

**Why Important**:
- Identifies resource bottlenecks
- Helps with infrastructure planning
- Prevents resource exhaustion

#### Concurrent Users
- **Active Users**: Number of users currently using the system
- **Peak Concurrent Users**: Maximum simultaneous users

**Why Important**:
- Directly relates to system load
- Helps with capacity planning
- Validates scalability

---

### When to Use Each Type of Testing

| Testing Type | Use Case | Frequency | Duration |
|-------------|----------|-----------|----------|
| **Load Testing** | Regular performance validation | Weekly/Monthly | 15-30 min |
| **Stress Testing** | Before major releases | Pre-release | 30-60 min |
| **Spike Testing** | Before high-traffic events | Before events | 10-20 min |
| **Soak Testing** | Long-term stability | Quarterly | 4-8 hours |
| **Scalability Testing** | Infrastructure changes | As needed | 30-60 min |

### Best Practices

1. **Start Small**: Begin with low load and gradually increase
2. **Monitor Everything**: Track all metrics, not just response times
3. **Test Realistic Scenarios**: Use production-like data and user behavior
4. **Baseline First**: Establish performance baselines before optimization
5. **Regular Testing**: Include performance testing in CI/CD pipeline
6. **Document Results**: Keep records for trend analysis
7. **Test in Production-like Environment**: Use staging environments that mirror production

## Test Reports

### HTML Report
After running tests, view the HTML report:
```bash
npx playwright show-report reports/html-report
```

### JSON Report
JSON test results are saved to: `reports/test-results.json`

### Screenshots
Screenshots on failure are saved to: `reports/screenshots/`

### K6 Reports
K6 test results are saved to: `reports/k6-results.json` (when using --out json flag)

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

This framework tests the **Automation Exercise** website: https://automationexercise.com

The website includes:
- User registration and login
- Product browsing and search
- Shopping cart functionality
- Checkout process
- Contact form
- Newsletter subscription

## Contributing

1. Follow the Page Object Model pattern
2. Add new page objects in the `pages/` directory
3. Add test data in `fixtures/test-data.json`
4. Write descriptive test names
5. Include proper assertions
6. Update documentation as needed

## License

ISC




