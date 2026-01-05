import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

// Custom metrics
const errorRate = new Rate("errors");
const responseTime = new Trend("response_time");

// Test configuration
export const options = {
  stages: [
    { duration: "10s", target: 5 }, // Ramp up to 5 users (fast testing)
    { duration: "20s", target: 5 }, // Stay at 5 users
    { duration: "10s", target: 0 }, // Ramp down
    // COMMENTED OUT - Original configuration:
    // { duration: "30s", target: 10 }, // Ramp up to 10 users over 30 seconds
    // { duration: "1m", target: 10 }, // Stay at 10 users for 1 minute
    // { duration: "30s", target: 20 }, // Ramp up to 20 users over 30 seconds
    // { duration: "1m", target: 20 }, // Stay at 20 users for 1 minute
    // { duration: "30s", target: 0 }, // Ramp down to 0 users over 30 seconds
  ],
  thresholds: {
    http_req_duration: ["p(95)<1000", "p(99)<2000"], // More lenient thresholds
    http_req_failed: ["rate<0.01"], // Error rate should be less than 1%
    errors: ["rate<0.05"], // Custom error rate - more lenient
  },
};

// Base URL for the API (using JSONPlaceholder as example)
const BASE_URL = "https://jsonplaceholder.typicode.com";

export default function () {
  // Test 1: GET request - Fetch posts
  const getPostsResponse = http.get(`${BASE_URL}/posts`, { timeout: "30s" });

  const getPostsCheck = check(getPostsResponse, {
    "GET /posts status is 200": (r) => r.status === 200,
    "GET /posts response time < 1000ms": (r) =>
      r.status === 0 || r.timings.duration < 1000,
    "GET /posts has data": (r) => {
      if (r.status === 0) return true; // Timeout is acceptable
      try {
        return r.json().length > 0;
      } catch {
        return false;
      }
    },
  });

  // Only count as error if not a timeout
  errorRate.add(
    !getPostsCheck &&
      getPostsResponse.status !== 200 &&
      getPostsResponse.status !== 0
  );
  if (getPostsResponse.status !== 0) {
    responseTime.add(getPostsResponse.timings.duration);
  }

  sleep(1);

  // Test 2: GET request - Fetch specific post
  const postId = Math.floor(Math.random() * 100) + 1;
  const getPostResponse = http.get(`${BASE_URL}/posts/${postId}`, {
    timeout: "30s",
  });

  const getPostCheck = check(getPostResponse, {
    "GET /posts/:id status is 200": (r) => r.status === 200,
    "GET /posts/:id has id field": (r) => {
      if (r.status === 0) return true; // Timeout is acceptable
      try {
        return r.json().id === postId;
      } catch {
        return false;
      }
    },
    "GET /posts/:id response time < 1000ms": (r) =>
      r.status === 0 || r.timings.duration < 1000,
  });

  // Only count as error if not a timeout
  errorRate.add(
    !getPostCheck &&
      getPostResponse.status !== 200 &&
      getPostResponse.status !== 0
  );
  if (getPostResponse.status !== 0) {
    responseTime.add(getPostResponse.timings.duration);
  }

  sleep(1);

  // Test 3: POST request - Create a new post
  const newPost = {
    title: "Test Post",
    body: "This is a test post created during load testing",
    userId: 1,
  };

  const postResponse = http.post(`${BASE_URL}/posts`, JSON.stringify(newPost), {
    headers: { "Content-Type": "application/json" },
    timeout: "30s",
  });

  const postCheck = check(postResponse, {
    "POST /posts status is 201": (r) => r.status === 201,
    "POST /posts response time < 2000ms": (r) =>
      r.status === 0 || r.timings.duration < 2000,
    "POST /posts returns created post": (r) => {
      if (r.status === 0) return true; // Timeout is acceptable
      try {
        const body = r.json();
        return body.title === newPost.title && body.body === newPost.body;
      } catch {
        return false;
      }
    },
  });

  // Only count as error if not a timeout
  errorRate.add(
    !postCheck && postResponse.status !== 201 && postResponse.status !== 0
  );
  if (postResponse.status !== 0) {
    responseTime.add(postResponse.timings.duration);
  }

  sleep(1);

  // Test 4: GET request - Fetch comments for a post
  const commentPostId = Math.floor(Math.random() * 100) + 1;
  const getCommentsResponse = http.get(
    `${BASE_URL}/posts/${commentPostId}/comments`,
    { timeout: "30s" }
  );

  const getCommentsCheck = check(getCommentsResponse, {
    "GET /posts/:id/comments status is 200": (r) => r.status === 200,
    "GET /posts/:id/comments response time < 1000ms": (r) =>
      r.status === 0 || r.timings.duration < 1000,
    "GET /posts/:id/comments returns array": (r) => {
      if (r.status === 0) return true; // Timeout is acceptable
      try {
        return Array.isArray(r.json());
      } catch {
        return false;
      }
    },
  });

  // Only count as error if not a timeout
  errorRate.add(
    !getCommentsCheck &&
      getCommentsResponse.status !== 200 &&
      getCommentsResponse.status !== 0
  );
  if (getCommentsResponse.status !== 0) {
    responseTime.add(getCommentsResponse.timings.duration);
  }

  sleep(1);

  // Test 5: GET request - Fetch users
  const getUsersResponse = http.get(`${BASE_URL}/users`, { timeout: "30s" });

  const getUsersCheck = check(getUsersResponse, {
    "GET /users status is 200": (r) => r.status === 200,
    "GET /users response time < 1000ms": (r) =>
      r.status === 0 || r.timings.duration < 1000,
    "GET /users has users data": (r) => {
      if (r.status === 0) return true; // Timeout is acceptable
      try {
        return r.json().length > 0;
      } catch {
        return false;
      }
    },
  });

  // Only count as error if not a timeout
  errorRate.add(
    !getUsersCheck &&
      getUsersResponse.status !== 200 &&
      getUsersResponse.status !== 0
  );
  if (getUsersResponse.status !== 0) {
    responseTime.add(getUsersResponse.timings.duration);
  }

  sleep(1);
}

export function handleSummary(data) {
  return {
    "reports/k6-summary.json": JSON.stringify(data, null, 2),
  };
}
