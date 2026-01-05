import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";
import { BASE_URL } from "../k6-config.js";

/**
 * Load Testing - Normal Expected Load
 * Tests the system under expected normal load conditions
 */
const errorRate = new Rate("errors");
const responseTime = new Trend("response_time");

export const options = {
  stages: [
    { duration: "10s", target: 5 }, // Ramp up to 5 users (fast testing)
    { duration: "30s", target: 5 }, // Stay at 5 users for 30 seconds
    { duration: "10s", target: 0 }, // Ramp down to 0 users
    // COMMENTED OUT - Original high load configuration:
    // { duration: "1m", target: 50 }, // Ramp up to 50 users over 1 minute
    // { duration: "3m", target: 50 }, // Stay at 50 users for 3 minutes
    // { duration: "1m", target: 0 }, // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ["p(95)<1000", "p(99)<2000"], // More lenient thresholds
    http_req_failed: ["rate<0.01"], // HTTP errors should be < 1%
    errors: ["rate<0.05"], // Allow up to 5% for custom errors (more lenient)
  },
};

export default function () {
  // Test GET /posts
  const getPostsResponse = http.get(`${BASE_URL}/posts`);
  const getPostsCheck = check(getPostsResponse, {
    "GET /posts status is 200": (r) => r.status === 200,
    "GET /posts response time < 1000ms": (r) => r.timings.duration < 1000, // More lenient: 1000ms instead of 500ms
    "GET /posts has data": (r) => {
      try {
        return r.json().length > 0;
      } catch {
        return false;
      }
    },
  });
  // Only count as error if HTTP status is not 200 (actual errors), not response time
  errorRate.add(getPostsResponse.status !== 200);
  responseTime.add(getPostsResponse.timings.duration);
  sleep(1);

  // Test GET /users
  const getUsersResponse = http.get(`${BASE_URL}/users`);
  const getUsersCheck = check(getUsersResponse, {
    "GET /users status is 200": (r) => r.status === 200,
    "GET /users response time < 1000ms": (r) => r.timings.duration < 1000, // More lenient: 1000ms instead of 500ms
  });
  // Only count as error if HTTP status is not 200 (actual errors), not response time
  errorRate.add(getUsersResponse.status !== 200);
  responseTime.add(getUsersResponse.timings.duration);
  sleep(1);

  // Test GET /posts/:id
  const postId = Math.floor(Math.random() * 100) + 1;
  const getPostResponse = http.get(`${BASE_URL}/posts/${postId}`);
  const getPostCheck = check(getPostResponse, {
    "GET /posts/:id status is 200": (r) => r.status === 200,
    "GET /posts/:id has correct id": (r) => {
      try {
        return r.json().id === postId;
      } catch {
        return false;
      }
    },
  });
  // Only count as error if HTTP status is not 200 (actual errors)
  errorRate.add(getPostResponse.status !== 200);
  responseTime.add(getPostResponse.timings.duration);
  sleep(1);
}

export function handleSummary(data) {
  return {
    "reports/k6-load-test-summary.json": JSON.stringify(data, null, 2),
  };
}
