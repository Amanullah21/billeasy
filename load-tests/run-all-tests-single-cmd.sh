#!/bin/bash

# Single command to run all K6 tests
# Usage: ./load-tests/run-all-tests-single-cmd.sh

k6 run load-tests/k6-scripts/01-load-test.js && \
k6 run load-tests/k6-scripts/02-stress-test.js && \
k6 run load-tests/k6-scripts/03-spike-test.js && \
k6 run load-tests/k6-scripts/04-soak-test.js && \
k6 run load-tests/k6-scripts/05-scalability-test.js && \
k6 run load-tests/k6-scripts/06-crud-operations-test.js && \
k6 run load-tests/k6-scripts/07-error-handling-test.js && \
k6 run load-tests/k6-scripts/08-concurrent-requests-test.js && \
k6 run load-tests/k6-scripts/09-volume-test.js && \
k6 run load-tests/k6-scripts/10-performance-benchmark-test.js && \
k6 run load-tests/k6-scripts/api-load-test.js






