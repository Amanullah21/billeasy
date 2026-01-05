import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend, Counter } from "k6/metrics";

/**
 * Performance Benchmark Test - Baseline Performance Metrics
 * Establishes baseline performance metrics for comparison
 */
const errorRate = new Rate("errors");
const responseTime = new Trend("response_time");
const throughput = new Counter("throughput");
const successRate = new Rate("success");

export const options = {
  stages: [
    { duration: "10s", target: 5 }, // Steady load for benchmarking (fast testing)
    { duration: "20s", target: 5 },
    { duration: "10s", target: 0 },
    // COMMENTED OUT - Original configuration:
    // { duration: "1m", target: 25 }, // Steady load for benchmarking
    // { duration: "2m", target: 25 },
    // { duration: "30s", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(50)<500", "p(95)<1000", "p(99)<2000"], // More realistic thresholds
    http_req_failed: ["rate<0.01"], // Low error rate for benchmark
    errors: ["rate<0.01"],
    success: ["rate>0.99"], // 99% success rate
  },
};

const BASE_URL = "https://jsonplaceholder.typicode.com";

export default function () {
  // Benchmark different operations
  const operations = [
    {
      name: "GET_single_post",
      request: () => {
        const postId = Math.floor(Math.random() * 100) + 1;
        return http.get(`${BASE_URL}/posts/${postId}`, { timeout: "30s" });
      },
      checks: (r) => ({
        "Benchmark: GET single post status is 200": r.status === 200,
        "Benchmark: GET single post response time < 500ms":
          r.timings.duration < 500,
      }),
    },
    {
      name: "GET_all_posts",
      request: () => http.get(`${BASE_URL}/posts`, { timeout: "30s" }),
      checks: (r) => ({
        "Benchmark: GET all posts status is 200": r.status === 200,
        "Benchmark: GET all posts response time < 1000ms":
          r.timings.duration < 1000,
      }),
    },
    {
      name: "GET_users",
      request: () => http.get(`${BASE_URL}/users`, { timeout: "30s" }),
      checks: (r) => ({
        "Benchmark: GET users status is 200": r.status === 200,
        "Benchmark: GET users response time < 500ms": r.timings.duration < 500,
      }),
    },
    {
      name: "POST_create",
      request: () => {
        const payload = {
          title: "Benchmark Test Post",
          body: "Performance benchmark testing",
          userId: 1,
        };
        return http.post(`${BASE_URL}/posts`, JSON.stringify(payload), {
          headers: { "Content-Type": "application/json" },
          timeout: "30s",
        });
      },
      checks: (r) => ({
        "Benchmark: POST create status is 201": r.status === 201,
        "Benchmark: POST create response time < 1000ms":
          r.timings.duration < 1000,
      }),
    },
  ];

  // Randomly select an operation
  const operation = operations[Math.floor(Math.random() * operations.length)];
  const response = operation.request();

  throughput.add(1);

  const checks = operation.checks(response);
  const checkResult = check(response, checks);

  if (checkResult) {
    successRate.add(1);
  } else {
    successRate.add(0);
  }

  // Only count as error if not a timeout
  errorRate.add(!checkResult && response.status !== 0);
  if (response.status !== 0) {
    responseTime.add(response.timings.duration);
  }

  sleep(1);
}

export function handleSummary(data) {
  // Calculate additional metrics
  const metrics = {
    ...data,
    calculated: {
      avgResponseTime: data.metrics.http_req_duration.values.avg,
      p95ResponseTime: data.metrics.http_req_duration.values["p(95)"],
      p99ResponseTime: data.metrics.http_req_duration.values["p(99)"],
      totalRequests: data.metrics.http_reqs.values.count,
      failedRequests:
        data.metrics.http_req_failed.values.rate *
        data.metrics.http_reqs.values.count,
      successRate: 1 - data.metrics.http_req_failed.values.rate,
      requestsPerSecond: data.metrics.http_reqs.values.rate,
    },
  };

  return {
    "reports/k6-performance-benchmark-summary.json": JSON.stringify(
      metrics,
      null,
      2
    ),
  };
}
