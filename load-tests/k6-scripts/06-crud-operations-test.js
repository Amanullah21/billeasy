import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { BASE_URL } from '../k6-config.js';

/**
 * CRUD Operations Test - Complete API Operations
 * Tests all CRUD operations (Create, Read, Update, Delete)
 */
const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');

export const options = {
  stages: [
    { duration: "10s", target: 5 }, // Fast testing: 5 users
    { duration: "20s", target: 5 },
    { duration: "10s", target: 0 },
    // COMMENTED OUT - Original configuration:
    // { duration: '30s', target: 20 },
    // { duration: '1m', target: 20 },
    // { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<2000", "p(99)<5000"],
    http_req_failed: ["rate<0.05"],
    errors: ["rate<0.05"],
  },
};

export default function () {
  // CREATE - POST request
  const newPost = {
    title: 'K6 Load Test Post',
    body: 'This is a test post created during load testing',
    userId: 1,
  };

  const createResponse = http.post(
    `${BASE_URL}/posts`,
    JSON.stringify(newPost),
    { 
      headers: { 'Content-Type': 'application/json' },
      timeout: '30s'
    }
  );

  const createCheck = check(createResponse, {
    'CREATE: POST /posts status is 201': (r) => r.status === 201,
    'CREATE: Response has id': (r) => {
      try {
        return r.json().id !== undefined;
      } catch {
        return false;
      }
    },
  });

  // Only count as error if not a timeout
  errorRate.add(!createCheck && createResponse.status !== 0);
  if (createResponse.status !== 0) {
    responseTime.add(createResponse.timings.duration);
  }
  sleep(1);

  // READ - GET request
  const postId = Math.floor(Math.random() * 100) + 1;
  const readResponse = http.get(`${BASE_URL}/posts/${postId}`, { timeout: '30s' });

  const readCheck = check(readResponse, {
    'READ: GET /posts/:id status is 200': (r) => r.status === 200,
    'READ: Response has data': (r) => {
      try {
        const data = r.json();
        return data.id !== undefined && data.title !== undefined;
      } catch {
        return false;
      }
    },
  });

  // Only count as error if not a timeout
  errorRate.add(!readCheck && readResponse.status !== 0);
  if (readResponse.status !== 0) {
    responseTime.add(readResponse.timings.duration);
  }
  sleep(1);

  // UPDATE - PUT request
  const updatedPost = {
    id: postId,
    title: 'Updated Post Title',
    body: 'Updated post body',
    userId: 1,
  };

  const updateResponse = http.put(
    `${BASE_URL}/posts/${postId}`,
    JSON.stringify(updatedPost),
    { 
      headers: { 'Content-Type': 'application/json' },
      timeout: '30s'
    }
  );

  const updateCheck = check(updateResponse, {
    'UPDATE: PUT /posts/:id status is 200': (r) => r.status === 200,
    'UPDATE: Response has updated data': (r) => {
      try {
        const data = r.json();
        return data.title === updatedPost.title;
      } catch {
        return false;
      }
    },
  });

  // Only count as error if not a timeout
  errorRate.add(!updateCheck && updateResponse.status !== 0);
  if (updateResponse.status !== 0) {
    responseTime.add(updateResponse.timings.duration);
  }
  sleep(1);

  // DELETE - DELETE request
  const deleteResponse = http.del(`${BASE_URL}/posts/${postId}`, null, { timeout: '30s' });

  const deleteCheck = check(deleteResponse, {
    'DELETE: DELETE /posts/:id status is 200': (r) => r.status === 200,
  });

  // Only count as error if not a timeout
  errorRate.add(!deleteCheck && deleteResponse.status !== 0);
  if (deleteResponse.status !== 0) {
    responseTime.add(deleteResponse.timings.duration);
  }
  sleep(1);
}

export function handleSummary(data) {
  return {
    'reports/k6-crud-test-summary.json': JSON.stringify(data, null, 2),
  };
}

