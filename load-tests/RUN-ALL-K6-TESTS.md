# Run All K6 Tests - Single Command

## Quick Start - One Command to Run All Tests

### Option 1: Using NPM Script (Recommended)
```bash
npm run load-test:all
```

### Option 2: Using Shell Script Directly
```bash
./load-tests/run-all-tests.sh
```

### Option 3: Single Line Command (Copy & Paste)
```bash
k6 run load-tests/k6-scripts/01-load-test.js && k6 run load-tests/k6-scripts/02-stress-test.js && k6 run load-tests/k6-scripts/03-spike-test.js && k6 run load-tests/k6-scripts/04-soak-test.js && k6 run load-tests/k6-scripts/05-scalability-test.js && k6 run load-tests/k6-scripts/06-crud-operations-test.js && k6 run load-tests/k6-scripts/07-error-handling-test.js && k6 run load-tests/k6-scripts/08-concurrent-requests-test.js && k6 run load-tests/k6-scripts/09-volume-test.js && k6 run load-tests/k6-scripts/10-performance-benchmark-test.js && k6 run load-tests/k6-scripts/api-load-test.js
```

### Option 4: Using the Single Command Script
```bash
./load-tests/run-all-tests-single-cmd.sh
```

## What Gets Run

The command runs all 11 K6 test scripts in order:
1. Load Test (normal load)
2. Stress Test (beyond capacity)
3. Spike Test (sudden load)
4. Soak Test (endurance - 30+ minutes)
5. Scalability Test (gradual scaling)
6. CRUD Operations Test
7. Error Handling Test
8. Concurrent Requests Test
9. Volume Test
10. Performance Benchmark Test
11. Original API Load Test

## Note

⚠️ **Warning**: The Soak Test (04-soak-test.js) runs for 30+ minutes. The entire suite will take approximately 40-45 minutes to complete.

If you want to skip the long-running soak test, you can run individual tests or use:
```bash
npm run load-test:quick
```

This runs only the first 3 quick tests (load, stress, spike).

## Test Results

All test results are saved to the `reports/` directory:
- `k6-load-test-summary.json`
- `k6-stress-test-summary.json`
- `k6-spike-test-summary.json`
- `k6-soak-test-summary.json`
- `k6-scalability-test-summary.json`
- `k6-crud-test-summary.json`
- `k6-error-handling-test-summary.json`
- `k6-concurrent-requests-test-summary.json`
- `k6-volume-test-summary.json`
- `k6-performance-benchmark-summary.json`






