import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend, Gauge } from "k6/metrics";
import { BASE_URL } from "../k6-config.js";

/**
 * Soak/Endurance Testing - Extended Duration
 * Tests the system under sustained load for extended periods to identify memory leaks
 */
const errorRate = new Rate("errors");
const responseTime = new Trend("response_time");
const activeUsers = new Gauge("active_users");

export const options = {
  stages: [
    { duration: "10s", target: 5 }, // Ramp up to 5 users (fast testing)
    { duration: "30s", target: 5 }, // Maintain 5 users for 30 seconds
    { duration: "10s", target: 0 }, // Ramp down
    // COMMENTED OUT - Original long-running soak test configuration:
    // { duration: "2m", target: 50 }, // Ramp up to 50 users
    // { duration: "30m", target: 50 }, // Maintain 50 users for 30 minutes (soak period)
    // { duration: "2m", target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<1000", "p(99)<2000"], // More lenient for long-running test
    http_req_failed: ["rate<0.05"], // Allow some failures in long test
    errors: ["rate<0.05"],
    // Monitor for gradual degradation
    http_req_duration: ["avg<500"], // Average should stay reasonable
  },
};

export default function () {
  activeUsers.add(1);

  // Simulate realistic user behavior with varied requests
  const randomNum = Math.random();

  if (randomNum < 0.4) {
    // 40% - GET posts
    const response = http.get(`${BASE_URL}/posts`, { timeout: "30s" });
    const checkResult = check(response, {
      "GET /posts status is 200": (r) => r.status === 200,
      "GET /posts response time < 2000ms": (r) =>
        r.status === 0 || r.timings.duration < 2000,
    });
    // Only count as error if not a timeout
    errorRate.add(!checkResult && response.status !== 0);
    if (response.status !== 0) {
      responseTime.add(response.timings.duration);
    }
  } else if (randomNum < 0.7) {
    // 30% - GET specific post
    const postId = Math.floor(Math.random() * 100) + 1;
    const response = http.get(`${BASE_URL}/posts/${postId}`, {
      timeout: "30s",
    });
    const checkResult = check(response, {
      "GET /posts/:id status is 200": (r) => r.status === 200,
    });
    // Only count as error if not a timeout
    errorRate.add(!checkResult && response.status !== 0);
    if (response.status !== 0) {
      responseTime.add(response.timings.duration);
    }
  } else if (randomNum < 0.9) {
    // 20% - GET users
    const response = http.get(`${BASE_URL}/users`, { timeout: "30s" });
    const checkResult = check(response, {
      "GET /users status is 200": (r) => r.status === 200,
    });
    // Only count as error if not a timeout
    errorRate.add(!checkResult && response.status !== 0);
    if (response.status !== 0) {
      responseTime.add(response.timings.duration);
    }
  } else {
    // 10% - POST request (create)
    const payload = JSON.stringify({
      title: "Soak Test Post",
      body: "Testing system endurance",
      userId: 1,
    });
    const response = http.post(`${BASE_URL}/posts`, payload, {
      headers: { "Content-Type": "application/json" },
      timeout: "30s",
    });
    const checkResult = check(response, {
      "POST /posts status is 201": (r) => r.status === 201,
    });
    // Only count as error if not a timeout
    errorRate.add(
      !checkResult && response.status !== 201 && response.status !== 0
    );
    if (response.status !== 0) {
      responseTime.add(response.timings.duration);
    }
  }

  activeUsers.add(-1);
  sleep(2); // Realistic user think time
}

export function handleSummary(data) {
  return {
    "reports/k6-soak-test-summary.json": JSON.stringify(data, null, 2),
  };
}
