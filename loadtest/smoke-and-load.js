// k6 load test for suppdoc.io — PUBLIC GET pages only.
// Run from YOUR machine, not blindly against prod:
//   k6 run loadtest/smoke-and-load.js --env BASE=https://www.suppdoc.io
//
// SAFETY: this only hits cached/static GET pages. It does NOT touch routes that
// write to the DB, send email, or call the LLM (those cost money / create spam).
// Do NOT point the high-VU stages at endpoints you pay per-request for.
//
// Switch scenario with --env SCENARIO=normal|high|stress|spike (default normal).

import http from "k6/http";
import { check, sleep, group } from "k6";
import { Rate, Trend } from "k6/metrics";

const BASE = __ENV.BASE || "http://localhost:3000";
const SCENARIO = __ENV.SCENARIO || "normal";

const errorRate = new Rate("errors");
const ttfb = new Trend("ttfb_ms", true);

// Public, cacheable GET pages — representative of real organic traffic.
const PAGES = [
  "/",
  "/pricing",
  "/build",
  "/audit",
  "/stacks",
  "/ingredients/ashwagandha",
  "/ingredients/magnesium-glycinate",
  "/best/sleep",
];

const STAGES = {
  // ~100 concurrent
  normal: [
    { duration: "30s", target: 20 },
    { duration: "2m", target: 100 },
    { duration: "1m", target: 100 },
    { duration: "30s", target: 0 },
  ],
  // ramp to 500 then 1000
  high: [
    { duration: "1m", target: 200 },
    { duration: "2m", target: 500 },
    { duration: "2m", target: 1000 },
    { duration: "1m", target: 0 },
  ],
  // stress to 5000 (find the knee)
  stress: [
    { duration: "2m", target: 1000 },
    { duration: "3m", target: 3000 },
    { duration: "3m", target: 5000 },
    { duration: "2m", target: 0 },
  ],
  // sudden spike
  spike: [
    { duration: "10s", target: 50 },
    { duration: "20s", target: 2000 },
    { duration: "1m", target: 2000 },
    { duration: "20s", target: 50 },
  ],
};

export const options = {
  stages: STAGES[SCENARIO] || STAGES.normal,
  thresholds: {
    http_req_failed: ["rate<0.02"], // <2% errors
    http_req_duration: ["p(95)<800", "p(99)<2000"], // P95<800ms, P99<2s
    errors: ["rate<0.02"],
  },
  // Be a good citizen: cap connections, realistic UA.
  userAgent: "suppdoc-loadtest/k6",
};

export default function () {
  group("public-pages", () => {
    const path = PAGES[Math.floor(Math.random() * PAGES.length)];
    const res = http.get(`${BASE}${path}`, { tags: { name: path } });
    ttfb.add(res.timings.waiting);
    const ok = check(res, {
      "status 200": (r) => r.status === 200,
      "has html": (r) => String(r.body || "").includes("<"),
    });
    errorRate.add(!ok);
  });
  sleep(Math.random() * 1.5 + 0.5); // 0.5–2s think time
}

// After a run, k6 prints: http_reqs (RPS via /duration), http_req_duration
// avg/p(95)/p(99), http_req_failed (error rate), and our ttfb_ms trend.
