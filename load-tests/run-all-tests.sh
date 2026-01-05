#!/bin/bash

# Script to run all K6 load test scripts sequentially
# Usage: ./load-tests/run-all-tests.sh

echo "=========================================="
echo "Running All K6 Load Test Scripts"
echo "=========================================="
echo ""

# Array of test scripts in order
scripts=(
  "01-load-test.js"
  "02-stress-test.js"
  "03-spike-test.js"
  "04-soak-test.js"
  "05-scalability-test.js"
  "06-crud-operations-test.js"
  "07-error-handling-test.js"
  "08-concurrent-requests-test.js"
  "09-volume-test.js"
  "10-performance-benchmark-test.js"
  "api-load-test.js"
)

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counter
total=${#scripts[@]}
current=0

# Run each script
for script in "${scripts[@]}"; do
  current=$((current + 1))
  echo ""
  echo "${BLUE}==========================================${NC}"
  echo "${GREEN}[$current/$total] Running: $script${NC}"
  echo "${BLUE}==========================================${NC}"
  echo ""
  
  # Run the K6 script
  k6 run "load-tests/k6-scripts/$script"
  
  # Check exit status
  if [ $? -eq 0 ]; then
    echo ""
    echo "${GREEN}✓ $script completed successfully${NC}"
  else
    echo ""
    echo "${YELLOW}⚠ $script completed with warnings/errors${NC}"
  fi
  
  # Wait between tests (optional)
  if [ $current -lt $total ]; then
    echo ""
    echo "${YELLOW}Waiting 3 seconds before next test...${NC}"
    sleep 3
  fi
done

echo ""
echo "${BLUE}==========================================${NC}"
echo "${GREEN}All K6 tests completed!${NC}"
echo "${BLUE}==========================================${NC}"
echo ""
echo "Check reports/ directory for test summaries:"
echo "  - k6-load-test-summary.json"
echo "  - k6-stress-test-summary.json"
echo "  - k6-spike-test-summary.json"
echo "  - k6-soak-test-summary.json"
echo "  - k6-scalability-test-summary.json"
echo "  - k6-crud-test-summary.json"
echo "  - k6-error-handling-test-summary.json"
echo "  - k6-concurrent-requests-test-summary.json"
echo "  - k6-volume-test-summary.json"
echo "  - k6-performance-benchmark-summary.json"
echo ""








