# Load Testing with K6

This directory contains K6 load testing scripts for API performance testing.

## Prerequisites

Install K6 based on your operating system:

### macOS

```bash
brew install k6
```

### Linux

```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D9B
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

### Windows

Download the installer from: https://k6.io/docs/getting-started/installation/

## Running Load Tests

### Quick Start - NPM Commands (Recommended)

**Run all K6 tests with a single command:**

```bash
npm run load-test:all
```

This runs all 11 K6 test scripts sequentially (~10-15 minutes)

**Run quick test suite (first 3 scripts):**

```bash
npm run load-test:quick
```

This runs the first 3 test scripts (~3-5 minutes)

**Run basic API load test:**

```bash
npm run load-test
```

### Basic Execution (Direct K6 Commands)

```bash
k6 run load-tests/k6-scripts/api-load-test.js
```

### With Custom Options

```bash
# Run with specific VUs (Virtual Users)
k6 run --vus 10 --duration 30s load-tests/k6-scripts/api-load-test.js

# Run with custom stages
k6 run --stage 30s:20 --stage 1m:20 --stage 30s:0 load-tests/k6-scripts/api-load-test.js
```

### Output Options

```bash
# Save results to JSON
k6 run --out json=reports/k6-results.json load-tests/k6-scripts/api-load-test.js

# Generate HTML report (requires k6-reporter extension)
k6 run --out json=reports/k6-results.json load-tests/k6-scripts/api-load-test.js
```

## Test Scripts

This directory contains comprehensive load testing scripts covering all types of performance testing scenarios:

### 01-load-test.js - Normal Load Testing

**Purpose**: Tests the system under expected normal load conditions.

**Features**:

- Ramp up to 50 users over 1 minute
- Maintain 50 users for 3 minutes
- Tests GET requests for posts, users, and specific posts
- Response time thresholds: P95 < 500ms, P99 < 1000ms
- Error rate threshold: < 1%

**Run**:

```bash       
k6 run load-tests/k6-scripts/01-load-test.js
```

---

### 02-stress-test.js - Stress Testing

**Purpose**: Tests the system beyond its normal operational capacity to find breaking points.

**Features**:

- Gradually increases load from 50 to 300 users
- Tests multiple endpoints (posts, users, comments, albums, photos)
- More lenient thresholds for stress conditions
- Identifies maximum capacity and failure points
- Response time thresholds: P95 < 2000ms, P99 < 5000ms
- Error rate threshold: < 5%

**Run**:

```bash
npm run load-test:quick        # Run quick suite (includes this one)
k6 run load-tests/k6-scripts/02-stress-test.js
```

---

### 03-spike-test.js - Spike Testing

**Purpose**: Tests the system's response to sudden, dramatic increases in load.

**Features**:

- Normal load: 10 users
- Sudden spikes: Instant jump to 100, then 200 users
- Tests multiple endpoints simultaneously using batch requests
- Validates system recovery after spikes
- Response time thresholds: P95 < 1000ms, P99 < 2000ms
- Error rate threshold: < 10% (during spikes)

**Run**:

```bash
k6 run load-tests/k6-scripts/03-spike-test.js
```

---

### 04-soak-test.js - Soak/Endurance Testing

**Purpose**: Tests the system under sustained load for extended periods to identify memory leaks.

**Features**:

- Maintains 50 users for 30 minutes
- Simulates realistic user behavior with varied request types
- Monitors for gradual performance degradation
- Tests GET and POST operations
- Response time thresholds: P95 < 500ms, P99 < 1000ms
- Error rate threshold: < 1%

**Run**:

```bash
k6 run load-tests/k6-scripts/04-soak-test.js
```

**Note**: This test runs for ~35 minutes. Use for long-term stability testing.

---

### 05-scalability-test.js - Scalability Testing

**Purpose**: Tests the system's ability to scale up based on demand.

**Features**:

- Gradual scaling: 10 → 25 → 50 → 100 users
- Weighted random endpoint selection
- Verifies performance doesn't degrade as load increases
- Tests multiple endpoints (posts, users, comments, albums)
- Response time thresholds: P95 < 500ms, P99 < 1000ms
- Error rate threshold: < 1%

**Run**:

```bash
npm run load-test:all          # Run all tests (includes this one)
k6 run load-tests/k6-scripts/05-scalability-test.js
```

---

### 06-crud-operations-test.js - CRUD Operations Test

**Purpose**: Tests all CRUD operations (Create, Read, Update, Delete).

**Features**:

- CREATE: POST request to create new posts
- READ: GET request to retrieve posts
- UPDATE: PUT request to update posts
- DELETE: DELETE request to remove posts
- Validates data integrity across operations
- Response time thresholds: P95 < 1000ms, P99 < 2000ms
- Error rate threshold: < 1%

**Run**:

```bash
npm run load-test:all          # Run all tests (includes this one)
k6 run load-tests/k6-scripts/06-crud-operations-test.js
```

---

### 07-error-handling-test.js - Error Handling Test

**Purpose**: Tests how the system handles various error conditions.

**Features**:

- Valid requests (should succeed)
- Invalid IDs (404 errors)
- Invalid endpoints (404 errors)
- Invalid POST data
- Query parameter handling
- Validates graceful error handling
- Error rate threshold: < 50% (expects some failures)

**Run**:

```bash
npm run load-test:all          # Run all tests (includes this one)
k6 run load-tests/k6-scripts/07-error-handling-test.js
```

---

### 08-concurrent-requests-test.js - Concurrent Requests Test

**Purpose**: Tests the system's ability to handle multiple concurrent requests.

**Features**:

- Uses http.batch() for simultaneous requests
- Tests 5 endpoints concurrently (posts, users, comments, albums, photos)
- Scales from 50 to 100 concurrent users
- Validates system handles concurrent load
- Response time thresholds: P95 < 1000ms, P99 < 2000ms
- Error rate threshold: < 1%

**Run**:

```bash
npm run load-test:all          # Run all tests (includes this one)
k6 run load-tests/k6-scripts/08-concurrent-requests-test.js
```

---

### 09-volume-test.js - Volume Testing

**Purpose**: Tests the system's ability to handle large volumes of data.

**Features**:

- Tests large datasets (all posts, all comments, all users)
- POST requests with large payloads
- Validates response size and data integrity
- Monitors performance with large data volumes
- Response time thresholds: P95 < 2000ms, P99 < 5000ms
- Error rate threshold: < 1%

**Run**:

```bash
npm run load-test:all          # Run all tests (includes this one)
k6 run load-tests/k6-scripts/09-volume-test.js
```

---

### 10-performance-benchmark-test.js - Performance Benchmark Test

**Purpose**: Establishes baseline performance metrics for comparison.

**Features**:

- Steady load of 25 users for benchmarking
- Tests multiple operation types (GET single, GET all, POST)
- Strict performance thresholds
- Calculates comprehensive metrics (avg, P95, P99, throughput, success rate)
- Response time thresholds: P50 < 200ms, P95 < 500ms, P99 < 1000ms
- Success rate threshold: > 99%

**Run**:

```bash
npm run load-test:all          # Run all tests (includes this one)
k6 run load-tests/k6-scripts/10-performance-benchmark-test.js
```

---

### api-load-test.js - Original Basic Load Test

**Purpose**: Basic load test script (original implementation).

**Features**:

- Simple ramp-up scenario
- Tests GET and POST operations
- Good starting point for load testing

**Run**:

```bash
npm run load-test              # Run this test via npm
npm run load-test:all          # Run all tests (includes this one)
k6 run load-tests/k6-scripts/api-load-test.js
```

---

## Running All Tests

### Run All Tests Sequentially

```bash
# Run all load test scripts
for script in load-tests/k6-scripts/*.js; do
  echo "Running $script..."
  k6 run "$script"
  echo "Completed $script"
  sleep 5
done
```

### Run Specific Test Type

```bash
# Load test only
k6 run load-tests/k6-scripts/01-load-test.js

# Stress test only
k6 run load-tests/k6-scripts/02-stress-test.js

# Spike test only
k6 run load-tests/k6-scripts/03-spike-test.js
```

## Understanding Results

### Custom Metrics

All test scripts include custom metrics:

- **Response Time**: Average, P50, P95, and P99 response times
- **Error Rate**: Percentage of failed requests
- **Throughput**: Requests per second
- **Success Rate**: Percentage of successful requests
- **Total Requests**: Count of all requests made

### Result Files

Test results are saved to:

- `reports/k6-*-test-summary.json` - JSON summary for each test type
- Console output - Real-time metrics during test execution

### Key Metrics to Analyze

1. **Response Time Metrics**:

   - Average: Mean response time
   - P95: 95% of requests complete within this time
   - P99: 99% of requests complete within this time

2. **Error Rate**:

   - Percentage of requests that failed
   - Should be < 1% for normal operations
   - May be higher during stress/spike tests

3. **Throughput**:

   - Requests per second (RPS)
   - Indicates system capacity

4. **Success Rate**:
   - Percentage of successful requests
   - Should be > 99% for normal operations

### Thresholds by Test Type

| Test Type        | P95 Threshold | P99 Threshold | Error Rate |
| ---------------- | ------------- | ------------- | ---------- |
| Load Test        | < 500ms       | < 1000ms      | < 1%       |
| Stress Test      | < 2000ms      | < 5000ms      | < 5%       |
| Spike Test       | < 1000ms      | < 2000ms      | < 10%      |
| Soak Test        | < 500ms       | < 1000ms      | < 1%       |
| Scalability Test | < 500ms       | < 1000ms      | < 1%       |
| CRUD Test        | < 1000ms      | < 2000ms      | < 1%       |
| Concurrent Test  | < 1000ms      | < 2000ms      | < 1%       |
| Volume Test      | < 2000ms      | < 5000ms      | < 1%       |
| Benchmark Test   | < 500ms       | < 1000ms      | < 0.1%     |

## Best Practices

1. **Start with Load Test**: Begin with `01-load-test.js` to establish baseline
2. **Run Stress Test**: Use `02-stress-test.js` to find breaking points
3. **Test Spikes**: Use `03-spike-test.js` before high-traffic events
4. **Long-term Stability**: Use `04-soak-test.js` quarterly for memory leak detection
5. **Monitor Metrics**: Review all custom metrics, not just response times
6. **Compare Results**: Use benchmark test to compare before/after optimizations
7. **Document Findings**: Keep records of test results for trend analysis
