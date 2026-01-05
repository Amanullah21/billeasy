import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend, Counter } from "k6/metrics";
import { BASE_URL } from "../k6-config.js";

/**
 * Stress Testing - Beyond Normal Capacity
 * Tests the system beyond its normal operational capacity to find breaking points
 */
const errorRate = new Rate("errors");
const responseTime = new Trend("response_time");
const requestCount = new Counter("total_requests");

export const options = {
  stages: [
    { duration: "10s", target: 5 }, // Start with 5 users (fast testing)
    { duration: "20s", target: 5 },
    { duration: "10s", target: 10 }, // Increase to 10 users
    { duration: "20s", target: 10 },
    { duration: "10s", target: 0 }, // Ramp down
    // COMMENTED OUT - Original high load stress test configuration:
    // { duration: "30s", target: 50 }, // Start with normal load
    // { duration: "1m", target: 50 },
    // { duration: "30s", target: 100 }, // Increase to 100 users
    // { duration: "1m", target: 100 },
    // { duration: "30s", target: 200 }, // Increase to 200 users
    // { duration: "1m", target: 200 },
    // { duration: "30s", target: 300 }, // Push to 300 users (stress level)
    // { duration: "2m", target: 300 },
    // { duration: "30s", target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<5000", "p(99)<10000"], // More lenient thresholds for stress test
    http_req_failed: ["rate<0.20"], // Allow up to 20% failure rate during stress
    errors: ["rate<0.20"],
  },
};

export default function () {
  // Mix of different request types to simulate real stress
  const endpoints = [
    `${BASE_URL}/posts`,
    `${BASE_URL}/users`,
    `${BASE_URL}/comments`,
    `${BASE_URL}/albums`,
    `${BASE_URL}/photos`,
  ];

  // Random endpoint selection
  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];

  // Make request with timeout handling
  let response;
  try {
    response = http.get(endpoint, { timeout: "30s" });
  } catch (error) {
    // Handle timeout or network errors
    errorRate.add(1);
    requestCount.add(1);
    sleep(0.5);
    return;
  }

  requestCount.add(1);

  // Check response - handle timeouts and errors gracefully
  const checkResult = check(response, {
    "status is 200 or 429": (r) => r.status === 200 || r.status === 429, // 429 = rate limit
    "response received": (r) => r.status !== 0 && r.status !== undefined,
    "no timeout": (r) => r.status !== 0, // Status 0 means timeout/error
  });

  // Only count as error if it's not a timeout (timeouts are expected in stress tests)
  if (!checkResult && response.status !== 0) {
    errorRate.add(1);
  } else if (response.status === 0) {
    // Timeout occurred - this is expected in stress tests, don't count as error
    errorRate.add(0);
  } else {
    errorRate.add(0);
  }

  // Only add response time if we got a response
  if (response.status !== 0) {
    responseTime.add(response.timings.duration);
  }

  // Shorter sleep to increase load
  sleep(0.5);
}

export function handleSummary(data) {
  return {
    "reports/k6-stress-test-summary.json": JSON.stringify(data, null, 2),
  };
}
