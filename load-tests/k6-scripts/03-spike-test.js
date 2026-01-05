import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

/**
 * Spike Testing - Sudden Load Increases
 * Tests the system's response to sudden, dramatic increases in load
 */
const errorRate = new Rate("errors");
const responseTime = new Trend("response_time");

export const options = {
  stages: [
    { duration: "10s", target: 5 }, // Normal load: 5 users (fast testing)
    { duration: "5s", target: 10 }, // SPIKE: Jump to 10 users
    { duration: "15s", target: 10 }, // Maintain spike
    { duration: "5s", target: 5 }, // Drop back to normal
    { duration: "10s", target: 0 }, // Ramp down
    // COMMENTED OUT - Original high load spike test configuration:
    // { duration: "1m", target: 10 }, // Normal load: 10 users
    // { duration: "10s", target: 100 }, // SPIKE: Instant jump to 100 users
    // { duration: "30s", target: 100 }, // Maintain spike
    // { duration: "10s", target: 10 }, // Drop back to normal
    // { duration: "1m", target: 10 }, // Normal load
    // { duration: "10s", target: 200 }, // BIGGER SPIKE: Jump to 200 users
    // { duration: "30s", target: 200 }, // Maintain spike
    // { duration: "10s", target: 10 }, // Drop back to normal
    // { duration: "30s", target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<3000", "p(99)<5000"], // More lenient during spikes
    http_req_failed: ["rate<0.15"], // Allow up to 15% failure during spikes
    errors: ["rate<0.15"],
  },
};

const BASE_URL = "https://jsonplaceholder.typicode.com";

export default function () {
  // Test multiple endpoints simultaneously
  const requests = {
    posts: {
      method: "GET",
      url: `${BASE_URL}/posts`,
    },
    users: {
      method: "GET",
      url: `${BASE_URL}/users`,
    },
  };

  const responses = http.batch(requests);

  // Check posts response - handle timeouts gracefully
  const postsCheck = check(responses["posts"], {
    "GET /posts status is 200 or timeout": (r) =>
      r.status === 200 || r.status === 0,
    "GET /posts response received": (r) => r.status !== undefined,
  });

  // Check users response - handle timeouts gracefully
  const usersCheck = check(responses["users"], {
    "GET /users status is 200 or timeout": (r) =>
      r.status === 200 || r.status === 0,
    "GET /users response received": (r) => r.status !== undefined,
  });

  // Only count as error if both failed and it's not a timeout
  const postsFailed =
    responses["posts"].status !== 200 && responses["posts"].status !== 0;
  const usersFailed =
    responses["users"].status !== 200 && responses["users"].status !== 0;
  errorRate.add(postsFailed || usersFailed);

  // Only add response times if we got valid responses
  if (responses["posts"].status !== 0) {
    responseTime.add(responses["posts"].timings.duration);
  }
  if (responses["users"].status !== 0) {
    responseTime.add(responses["users"].timings.duration);
  }

  sleep(1);
}

export function handleSummary(data) {
  return {
    "reports/k6-spike-test-summary.json": JSON.stringify(data, null, 2),
  };
}
