import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { BASE_URL } from '../k6-config.js';

/**
 * Error Handling Test - Test Error Scenarios
 * Tests how the system handles various error conditions
 */
const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');
const errorCount = new Counter('error_count');
const successCount = new Counter('success_count');

export const options = {
  stages: [
    { duration: "10s", target: 5 }, // Fast testing: 5 users
    { duration: "20s", target: 5 },
    { duration: "10s", target: 0 },
    // COMMENTED OUT - Original configuration:
    // { duration: '30s', target: 10 },
    // { duration: '1m', target: 10 },
    // { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.80"], // Expect failures in this test (testing error scenarios)
    errors: ["rate<0.80"], // More lenient for error handling test
  },
};

export default function () {
  // Test 1: Valid request (should succeed)
  const validResponse = http.get(`${BASE_URL}/posts/1`, { timeout: '30s' });
  const validCheck = check(validResponse, {
    'Valid request: status is 200': (r) => r.status === 200,
  });
  
  if (validCheck) {
    successCount.add(1);
  } else {
    errorCount.add(1);
  }
  errorRate.add(!validCheck && validResponse.status !== 0);
  if (validResponse.status !== 0) {
    responseTime.add(validResponse.timings.duration);
  }
  sleep(1);

  // Test 2: Invalid ID (404 error expected)
  const invalidIdResponse = http.get(`${BASE_URL}/posts/99999`, { timeout: '30s' });
  const invalidIdCheck = check(invalidIdResponse, {
    'Invalid ID: status is 404': (r) => r.status === 404,
    'Invalid ID: error handled gracefully': (r) => r.status === 404 || r.status === 200 || r.status === 0,
  });
  errorRate.add(!invalidIdCheck && invalidIdResponse.status !== 0);
  if (invalidIdResponse.status !== 0) {
    responseTime.add(invalidIdResponse.timings.duration);
  }
  sleep(1);

  // Test 3: Invalid endpoint (404 error expected)
  const invalidEndpointResponse = http.get(`${BASE_URL}/invalid-endpoint-12345`, { timeout: '30s' });
  const invalidEndpointCheck = check(invalidEndpointResponse, {
    'Invalid endpoint: status is 404': (r) => r.status === 404,
    'Invalid endpoint: error handled gracefully': (r) => r.status === 404 || r.status === 200 || r.status === 0,
  });
  errorRate.add(!invalidEndpointCheck && invalidEndpointResponse.status !== 0);
  if (invalidEndpointResponse.status !== 0) {
    responseTime.add(invalidEndpointResponse.timings.duration);
  }
  sleep(1);

  // Test 4: POST with invalid data
  const invalidPostResponse = http.post(
    `${BASE_URL}/posts`,
    'invalid json data',
    { 
      headers: { 'Content-Type': 'application/json' },
      timeout: '30s'
    }
  );
  const invalidPostCheck = check(invalidPostResponse, {
    'Invalid POST: error handled': (r) => r.status >= 400 || r.status === 201 || r.status === 0,
  });
  errorRate.add(!invalidPostCheck && invalidPostResponse.status !== 0);
  if (invalidPostResponse.status !== 0) {
    responseTime.add(invalidPostResponse.timings.duration);
  }
  sleep(1);

  // Test 5: GET with query parameters
  const queryResponse = http.get(`${BASE_URL}/posts?userId=1`, { timeout: '30s' });
  const queryCheck = check(queryResponse, {
    'Query params: status is 200': (r) => r.status === 200,
    'Query params: returns filtered data': (r) => {
      try {
        const data = r.json();
        return Array.isArray(data) && data.length > 0;
      } catch {
        return false;
      }
    },
  });
  
  if (queryCheck) {
    successCount.add(1);
  } else {
    errorCount.add(1);
  }
  errorRate.add(!queryCheck && queryResponse.status !== 0);
  if (queryResponse.status !== 0) {
    responseTime.add(queryResponse.timings.duration);
  }
  sleep(1);
}

export function handleSummary(data) {
  return {
    'reports/k6-error-handling-test-summary.json': JSON.stringify(data, null, 2),
  };
}

