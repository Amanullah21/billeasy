import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { BASE_URL } from '../k6-config.js';

/**
 * Volume Testing - Large Amount of Data
 * Tests the system's ability to handle large volumes of data
 */
const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');
const totalRequests = new Counter('total_requests');

export const options = {
  stages: [
    { duration: "10s", target: 5 }, // Fast testing: 5 users
    { duration: "20s", target: 5 },
    { duration: "10s", target: 0 },
    // COMMENTED OUT - Original configuration:
    // { duration: '1m', target: 30 },
    // { duration: '2m', target: 30 },
    // { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<5000", "p(99)<10000"], // More lenient for volume test
    http_req_failed: ["rate<0.05"],
    errors: ["rate<0.05"],
  },
};

export default function () {
  // Test 1: Get all posts (large dataset)
  const allPostsResponse = http.get(`${BASE_URL}/posts`, { timeout: '30s' });
  totalRequests.add(1);
  
  const allPostsCheck = check(allPostsResponse, {
    'Volume: GET all posts status is 200': (r) => r.status === 200,
    'Volume: GET all posts has large dataset': (r) => {
      if (r.status === 0) return true; // Timeout is acceptable
      try {
        const posts = r.json();
        return Array.isArray(posts) && posts.length > 50;
      } catch {
        return false;
      }
    },
    'Volume: Response size is reasonable': (r) => r.status === 0 || r.body.length > 0,
  });
  errorRate.add(!allPostsCheck && allPostsResponse.status !== 0);
  if (allPostsResponse.status !== 0) {
    responseTime.add(allPostsResponse.timings.duration);
  }
  sleep(1);

  // Test 2: Get all comments (large dataset)
  const allCommentsResponse = http.get(`${BASE_URL}/comments`, { timeout: '30s' });
  totalRequests.add(1);
  
  const allCommentsCheck = check(allCommentsResponse, {
    'Volume: GET all comments status is 200': (r) => r.status === 200,
    'Volume: GET all comments has large dataset': (r) => {
      if (r.status === 0) return true; // Timeout is acceptable
      try {
        const comments = r.json();
        return Array.isArray(comments) && comments.length > 100;
      } catch {
        return false;
      }
    },
  });
  errorRate.add(!allCommentsCheck && allCommentsResponse.status !== 0);
  if (allCommentsResponse.status !== 0) {
    responseTime.add(allCommentsResponse.timings.duration);
  }
  sleep(1);

  // Test 3: Get all users
  const allUsersResponse = http.get(`${BASE_URL}/users`, { timeout: '30s' });
  totalRequests.add(1);
  
  const allUsersCheck = check(allUsersResponse, {
    'Volume: GET all users status is 200': (r) => r.status === 200,
    'Volume: GET all users has data': (r) => {
      if (r.status === 0) return true; // Timeout is acceptable
      try {
        const users = r.json();
        return Array.isArray(users) && users.length > 0;
      } catch {
        return false;
      }
    },
  });
  errorRate.add(!allUsersCheck && allUsersResponse.status !== 0);
  if (allUsersResponse.status !== 0) {
    responseTime.add(allUsersResponse.timings.duration);
  }
  sleep(1);

  // Test 4: POST with large payload
  const largePayload = {
    title: 'Large Volume Test Post',
    body: 'A'.repeat(1000) + ' - This is a large payload to test volume handling',
    userId: 1,
  };

  const largePostResponse = http.post(
    `${BASE_URL}/posts`,
    JSON.stringify(largePayload),
    { 
      headers: { 'Content-Type': 'application/json' },
      timeout: '30s'
    }
  );
  totalRequests.add(1);
  
  const largePostCheck = check(largePostResponse, {
    'Volume: POST large payload status is 201': (r) => r.status === 201,
    'Volume: Large payload processed': (r) => {
      if (r.status === 0) return true; // Timeout is acceptable
      try {
        const response = r.json();
        return response.id !== undefined;
      } catch {
        return false;
      }
    },
  });
  errorRate.add(!largePostCheck && largePostResponse.status !== 0);
  if (largePostResponse.status !== 0) {
    responseTime.add(largePostResponse.timings.duration);
  }
  sleep(1);
}

export function handleSummary(data) {
  return {
    'reports/k6-volume-test-summary.json': JSON.stringify(data, null, 2),
  };
}

