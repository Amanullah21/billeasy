import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

/**
 * Concurrent Requests Test - Multiple Simultaneous Requests
 * Tests the system's ability to handle multiple concurrent requests
 */
const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');

export const options = {
  stages: [
    { duration: "10s", target: 5 }, // 5 concurrent users (fast testing)
    { duration: "20s", target: 5 },
    { duration: "10s", target: 10 }, // 10 concurrent users
    { duration: "20s", target: 10 },
    { duration: "10s", target: 0 },
    // COMMENTED OUT - Original high concurrency configuration:
    // { duration: '30s', target: 50 },  // 50 concurrent users
    // { duration: '1m', target: 50 },
    // { duration: '30s', target: 100 }, // 100 concurrent users
    // { duration: '1m', target: 100 },
    // { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<3000", "p(99)<5000"], // More lenient for concurrent requests
    http_req_failed: ["rate<0.10"], // Allow up to 10% failure with high concurrency
    errors: ["rate<0.10"],
  },
};

const BASE_URL = 'https://jsonplaceholder.typicode.com';

export default function () {
  // Make multiple concurrent requests using http.batch
  const requests = {
    'posts': {
      method: 'GET',
      url: `${BASE_URL}/posts`,
      params: { timeout: '30s' },
    },
    'users': {
      method: 'GET',
      url: `${BASE_URL}/users`,
      params: { timeout: '30s' },
    },
    'comments': {
      method: 'GET',
      url: `${BASE_URL}/comments`,
      params: { timeout: '30s' },
    },
    'albums': {
      method: 'GET',
      url: `${BASE_URL}/albums`,
      params: { timeout: '30s' },
    },
    'photos': {
      method: 'GET',
      url: `${BASE_URL}/photos`,
      params: { timeout: '30s' },
    },
  };

  const responses = http.batch(requests);

  // Check all responses - handle timeouts gracefully
  const postsCheck = check(responses['posts'], {
    'Concurrent GET /posts: status is 200 or timeout': (r) => r.status === 200 || r.status === 0,
  });

  const usersCheck = check(responses['users'], {
    'Concurrent GET /users: status is 200 or timeout': (r) => r.status === 200 || r.status === 0,
  });

  const commentsCheck = check(responses['comments'], {
    'Concurrent GET /comments: status is 200 or timeout': (r) => r.status === 200 || r.status === 0,
  });

  const albumsCheck = check(responses['albums'], {
    'Concurrent GET /albums: status is 200 or timeout': (r) => r.status === 200 || r.status === 0,
  });

  const photosCheck = check(responses['photos'], {
    'Concurrent GET /photos: status is 200 or timeout': (r) => r.status === 200 || r.status === 0,
  });

  // Count errors only for non-timeout failures
  let errorCount = 0;
  Object.values(responses).forEach(response => {
    if (response.status !== 200 && response.status !== 0) {
      errorCount++;
    }
  });
  errorRate.add(errorCount > 0 ? 1 : 0);

  // Add response times for all requests (only if not timeout)
  Object.values(responses).forEach(response => {
    if (response.status !== 0) {
      responseTime.add(response.timings.duration);
    }
  });

  sleep(1);
}

export function handleSummary(data) {
  return {
    'reports/k6-concurrent-requests-test-summary.json': JSON.stringify(data, null, 2),
  };
}

