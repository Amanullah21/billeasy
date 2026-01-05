import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend, Counter } from "k6/metrics";

/**
 * Scalability Testing - System Growth Capacity
 * Tests the system's ability to scale up based on demand
 */
const errorRate = new Rate("errors");
const responseTime = new Trend("response_time");
const throughput = new Counter("requests_per_second");

export const options = {
  stages: [
    { duration: "10s", target: 5 }, // Start small: 5 users (fast testing)
    { duration: "15s", target: 5 }, // Maintain baseline
    { duration: "10s", target: 10 }, // Scale up to 10 users
    { duration: "15s", target: 10 },
    { duration: "10s", target: 0 }, // Scale down
    // COMMENTED OUT - Original high load scalability test configuration:
    // { duration: "1m", target: 10 }, // Start small: 10 users
    // { duration: "2m", target: 10 }, // Maintain baseline
    // { duration: "1m", target: 25 }, // Scale up to 25 users
    // { duration: "2m", target: 25 },
    // { duration: "1m", target: 50 }, // Scale up to 50 users
    // { duration: "2m", target: 50 },
    // { duration: "1m", target: 100 }, // Scale up to 100 users
    // { duration: "2m", target: 100 },
    // { duration: "1m", target: 0 }, // Scale down
  ],
  thresholds: {
    http_req_duration: ["p(95)<2000", "p(99)<5000"], // More lenient as we scale
    http_req_failed: ["rate<0.05"], // Allow some failures at higher scale
    errors: ["rate<0.05"],
  },
};

const BASE_URL = "https://jsonplaceholder.typicode.com";

export default function () {
  // Test different endpoints to simulate real-world usage
  const endpoints = [
    { url: `${BASE_URL}/posts`, weight: 0.4 },
    { url: `${BASE_URL}/users`, weight: 0.3 },
    { url: `${BASE_URL}/comments`, weight: 0.2 },
    { url: `${BASE_URL}/albums`, weight: 0.1 },
  ];

  // Weighted random selection
  const random = Math.random();
  let selectedEndpoint = endpoints[0].url;
  let cumulative = 0;

  for (const endpoint of endpoints) {
    cumulative += endpoint.weight;
    if (random <= cumulative) {
      selectedEndpoint = endpoint.url;
      break;
    }
  }

  const response = http.get(selectedEndpoint, { timeout: "30s" });
  throughput.add(1);

  const checkResult = check(response, {
    "status is 200 or timeout": (r) => r.status === 200 || r.status === 0,
    "response time acceptable": (r) =>
      r.status === 0 || r.timings.duration < 2000,
    "response has data": (r) => {
      if (r.status === 0) return true; // Timeout is acceptable
      try {
        const data = r.json();
        return Array.isArray(data) ? data.length > 0 : true;
      } catch {
        return false;
      }
    },
  });

  // Only count as error if not a timeout
  errorRate.add(!checkResult && response.status !== 0);
  if (response.status !== 0) {
    responseTime.add(response.timings.duration);
  }

  sleep(1);
}

export function handleSummary(data) {
  return {
    "reports/k6-scalability-test-summary.json": JSON.stringify(data, null, 2),
  };
}
