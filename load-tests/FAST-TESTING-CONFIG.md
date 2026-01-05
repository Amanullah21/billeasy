# Fast Testing Configuration

## Overview

All K6 load test scripts have been optimized for **fast testing** with **5-10 users** instead of high load configurations (50-300 users). This allows for quick validation and testing without waiting for long-running tests.

## Changes Made

### 1. **Removed Invalid `httpReq` Option**
- ❌ **Removed**: `httpReq: { timeout: "30s" }` (not a valid K6 option)
- ✅ **Kept**: Timeout in individual requests: `http.get(url, { timeout: "30s" })`

### 2. **Reduced User Counts**
All scripts now use **5-10 users** instead of high loads:

| Script | Original Users | New Users | Duration |
|--------|---------------|-----------|----------|
| 01-load-test.js | 50 | 5 | ~50s (was 5m) |
| 02-stress-test.js | 50-300 | 5-10 | ~1m (was 7.5m) |
| 03-spike-test.js | 10-200 | 5-10 | ~45s (was 4m) |
| 04-soak-test.js | 50 for 30m | 5 for 30s | ~50s (was 34m) |
| 05-scalability-test.js | 10-100 | 5-10 | ~1m (was 10m) |
| 06-crud-operations-test.js | 20 | 5 | ~40s (was 2m) |
| 07-error-handling-test.js | 10 | 5 | ~40s (was 2m) |
| 08-concurrent-requests-test.js | 50-100 | 5-10 | ~1m (was 3m) |
| 09-volume-test.js | 30 | 5 | ~40s (was 3.5m) |
| 10-performance-benchmark-test.js | 25 | 5 | ~40s (was 3.5m) |
| api-load-test.js | 10-20 | 5 | ~40s (was 3m) |

### 3. **Commented Out Original Configurations**
All original high-load configurations are preserved as comments, so you can easily restore them:

```javascript
// COMMENTED OUT - Original high load configuration:
// { duration: "1m", target: 50 },
// { duration: "3m", target: 50 },
```

## Running Tests

### Quick Test (All Scripts)
```bash
npm run load-test:all
```
**Estimated Time**: ~10-15 minutes (was 1+ hour)

### Quick Test (First 3 Scripts)
```bash
npm run load-test:quick
```
**Estimated Time**: ~3-5 minutes

### Individual Script
```bash
k6 run load-tests/k6-scripts/01-load-test.js
```

## Reports

All test reports are saved in the `reports/` directory:

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
- `k6-summary.json` (api-load-test)

## Restoring High Load Tests

To restore high load configurations:

1. Open the script file
2. Uncomment the original configuration
3. Comment out the fast testing configuration
4. Save and run

Example:
```javascript
export const options = {
  stages: [
    // { duration: "10s", target: 5 }, // Fast testing
    // { duration: "20s", target: 5 },
    // { duration: "10s", target: 0 },
    { duration: "1m", target: 50 }, // Original high load
    { duration: "3m", target: 50 },
    { duration: "1m", target: 0 },
  ],
  // ...
};
```

## Benefits

✅ **Faster Testing**: Complete test suite runs in ~10-15 minutes instead of 1+ hour  
✅ **Quick Validation**: Verify scripts work correctly before running full load tests  
✅ **CI/CD Friendly**: Faster feedback in continuous integration pipelines  
✅ **Easy Restoration**: Original configurations preserved as comments  
✅ **No Breaking Changes**: All scripts maintain same structure and functionality  

## Notes

- Timeouts are still configured per-request (30 seconds)
- Thresholds remain the same (appropriate for both fast and high-load tests)
- Error handling and metrics collection unchanged
- All test logic and assertions remain intact



