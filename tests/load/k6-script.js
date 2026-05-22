import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '2m', target: 50 },
    { duration: '5m', target: 50 },
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<2000'],
    errors: ['rate<0.05'],
  },
};

const BASE_URL = __ENV.API_BASE_URL || 'http://localhost:8080';

export default function () {
  const responses = http.batch([
    ['GET', `${BASE_URL}/healthz`, null, { tags: { name: 'health' } }],
    ['GET', `${BASE_URL}/api/v1/credentials/test`, null, {
      tags: { name: 'credential' },
      headers: { Authorization: 'Bearer test-token' },
    }],
    ['GET', `${BASE_URL}/api/v1/reputation/0xtest`, null, {
      tags: { name: 'reputation' },
    }],
  ]);

  responses.forEach((res) => {
    errorRate.add(res.status >= 400);
    check(res, {
      'status is 200': (r) => r.status === 200,
      'response time < 500ms': (r) => r.timings.duration < 500,
    });
  });

  sleep(1);
}
