/**
 * Sahayog24x7 — Automated API Test Suite
 * Run: node tests/api.test.js
 * Requires: MongoDB (local or Atlas) running — URI from .env
 */

const http = require("http");
const path = require("path");
const fs = require("fs");

const BASE = "http://localhost:5000";
const results = [];
let TOKEN = "";
let COMPLAINT_ID = "";
let WORKER_ID = "";

function request(method, url, opts = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url.startsWith("http") ? url : BASE + url);
    const options = {
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      method,
      headers: { ...opts.headers },
    };

    if (opts.token) {
      options.headers["Authorization"] = `Bearer ${opts.token}`;
    }

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        let json;
        try {
          json = JSON.parse(data);
        } catch {
          json = data;
        }
        resolve({ status: res.statusCode, body: json });
      });
    });

    req.on("error", reject);

    if (opts.body) {
      if (opts.formData) {
        // For file uploads — use the raw body from opts.body already set
        req.write(opts.body);
      } else {
        req.setHeader("Content-Type", "application/json");
        req.write(JSON.stringify(opts.body));
      }
    }

    req.end();
  });
}

function test(name, fn) {
  return fn()
    .then((result) => {
      const pass = result.pass;
      results.push({ name, pass, ...(result.detail ? { detail: result.detail } : {}) });
      console.log(`  ${pass ? "✅" : "❌"} ${name}${result.detail ? " — " + result.detail : ""}`);
    })
    .catch((err) => {
      results.push({ name, pass: false, detail: err.message });
      console.log(`  ❌ ${name} — ${err.message}`);
    });
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg || "Assertion failed");
}

async function run() {
  console.log("\n🧪 Sahayog24x7 API Test Suite\n");
  console.log(`Server: ${BASE}\n`);

  // ── Test 1: Health Check ──
  await test("1. Health Check", async () => {
    const r = await request("GET", "/api/health");
    assert(r.status === 200, `Expected 200, got ${r.status}`);
    assert(r.body.status === "OK");
    return { pass: true };
  });

  // ── Test 2: Seed Worker ──
  await test("2. Seed Worker", async () => {
    const r = await request("POST", "/api/auth/seed", {
      body: { employeeId: "WB001", name: "Rahul Das", password: "password123" },
    });
    assert(r.status === 201, `Expected 201, got ${r.status}`);
    assert(r.body.worker && r.body.worker.employeeId === "WB001");
    WORKER_ID = r.body.worker.id;
    return { pass: true };
  });

  // ── Test 3: Seed Duplicate ──
  await test("3. Seed Duplicate Worker (409)", async () => {
    const r = await request("POST", "/api/auth/seed", {
      body: { employeeId: "WB001", name: "Rahul Das", password: "password123" },
    });
    assert(r.status === 409, `Expected 409, got ${r.status}`);
    return { pass: true };
  });

  // ── Test 4: Login Valid ──
  await test("4. Login — Valid Credentials", async () => {
    const r = await request("POST", "/api/auth/login", {
      body: { employeeId: "WB001", password: "password123" },
    });
    assert(r.status === 200, `Expected 200, got ${r.status}`);
    assert(r.body.token && r.body.worker);
    TOKEN = r.body.token;
    return { pass: true };
  });

  // ── Test 5: Login Invalid ──
  await test("5. Login — Invalid Password (401)", async () => {
    const r = await request("POST", "/api/auth/login", {
      body: { employeeId: "WB001", password: "wrongpassword" },
    });
    assert(r.status === 401, `Expected 401, got ${r.status}`);
    return { pass: true };
  });

  // ── Test 6: Login Missing Fields ──
  await test("6. Login — Missing Fields (400)", async () => {
    const r = await request("POST", "/api/auth/login", { body: {} });
    assert(r.status === 400, `Expected 400, got ${r.status}`);
    return { pass: true };
  });

  // ── Test 7: Get Complaints No Auth ──
  await test("7. Get Complaints — No Token (401)", async () => {
    const r = await request("GET", "/api/complaints");
    assert(r.status === 401, `Expected 401, got ${r.status}`);
    return { pass: true };
  });

  // ── Test 8: Get Complaints With Auth ──
  await test("8. Get Complaints — With Token (200)", async () => {
    const r = await request("GET", "/api/complaints", { token: TOKEN });
    assert(r.status === 200, `Expected 200, got ${r.status}`);
    assert(Array.isArray(r.body));
    return { pass: true };
  });

  // ── Test 9: Get Complaint Not Found ──
  await test("9. Get Complaint — Not Found (404)", async () => {
    const r = await request("GET", "/api/complaints/000000000000000000000000", { token: TOKEN });
    assert(r.status === 404, `Expected 404, got ${r.status}`);
    return { pass: true };
  });

  // ── Test 10: Start Work Not Found ──
  await test("10. Start Work — Not Found (404)", async () => {
    const r = await request("PUT", "/api/complaints/000000000000000000000000/start", { token: TOKEN });
    assert(r.status === 404, `Expected 404, got ${r.status}`);
    return { pass: true };
  });

  // ── Test 11: Submit Report No Auth ──
  await test("11. Submit Report — No Token (401)", async () => {
    const r = await request("POST", "/api/work-report", {
      body: { complaintId: "000000000000000000000000" },
    });
    assert(r.status === 401, `Expected 401, got ${r.status}`);
    return { pass: true };
  });

  // ── Test 12: Submit Report Missing Fields ──
  await test("12. Submit Report — Missing Fields (400)", async () => {
    const r = await request("POST", "/api/work-report", {
      token: TOKEN,
      body: { complaintId: "000000000000000000000000" },
    });
    assert(r.status === 400, `Expected 400, got ${r.status}`);
    return { pass: true };
  });

  await test("12b. Submit Report via /submit route — Missing Fields (400)", async () => {
    const r = await request("POST", "/api/work-report/submit", {
      token: TOKEN,
      body: { complaintId: "000000000000000000000000" },
    });
    assert(r.status === 400, `Expected 400, got ${r.status}`);
    return { pass: true };
  });

  // ── Test 13: Full Workflow ──
  // This requires a pre-seeded complaint in the DB. We attempt it but note it's partial without DB seed.
  await test("13a. Get Assigned Complaints (may be empty)", async () => {
    const r = await request("GET", "/api/complaints", { token: TOKEN });
    assert(r.status === 200);
    if (r.body.length > 0) {
      COMPLAINT_ID = r.body[0]._id;
    }
    return { pass: true, detail: `${r.body.length} complaints found` };
  });

  if (COMPLAINT_ID) {
    await test("13b. Start Work", async () => {
      const r = await request("PUT", `/api/complaints/${COMPLAINT_ID}/start`, { token: TOKEN });
      assert(r.status === 200, `Expected 200, got ${r.status}`);
      assert(r.body.status === "IN_PROGRESS");
      assert(r.body.startTime !== null);
      return { pass: true };
    });

    await test("13c. Submit Work Report", async () => {
      // Create a dummy image
      const boundary = "----TestBoundary" + Date.now();
      let body = "";
      body += `--${boundary}\r\n`;
      body += 'Content-Disposition: form-data; name="complaintId"\r\n\r\n';
      body += `${COMPLAINT_ID}\r\n`;
      body += `--${boundary}\r\n`;
      body += 'Content-Disposition: form-data; name="workPerformed"\r\n\r\n';
      body += "Fuse replaced and transformer reset\r\n";
      body += `--${boundary}\r\n`;
      body += 'Content-Disposition: form-data; name="conditionAfter"\r\n\r\n';
      body += "Supply restored successfully\r\n";
      body += `--${boundary}\r\n`;
      body += 'Content-Disposition: form-data; name="afterPhoto"; filename="test.jpg"\r\n';
      body += "Content-Type: image/jpeg\r\n\r\n";
      body += "fake-image-data\r\n";
      body += `--${boundary}--\r\n`;

      const r = await request("POST", "/api/work-report", {
        token: TOKEN,
        headers: { "Content-Type": `multipart/form-data; boundary=${boundary}` },
        body,
      });
      assert(r.status === 201, `Expected 201, got ${r.status}`);
      assert(r.body.workReport && r.body.complaint);
      assert(r.body.complaint.status === "COMPLETED");
      assert(typeof r.body.complaint.timeTakenInSeconds === "number");
      return { pass: true };
    });

    await test("13d. Verify Completed Status", async () => {
      const r = await request("GET", `/api/complaints/${COMPLAINT_ID}`, { token: TOKEN });
      assert(r.status === 200);
      assert(r.body.status === "COMPLETED");
      return { pass: true };
    });

    await test("14. Start Work on Completed (400)", async () => {
      const r = await request("PUT", `/api/complaints/${COMPLAINT_ID}/start`, { token: TOKEN });
      assert(r.status === 400, `Expected 400, got ${r.status}`);
      return { pass: true };
    });

    await test("15. Submit Report on Completed (400)", async () => {
      const boundary = "----TestBoundary" + Date.now();
      let body = "";
      body += `--${boundary}\r\n`;
      body += 'Content-Disposition: form-data; name="complaintId"\r\n\r\n';
      body += `${COMPLAINT_ID}\r\n`;
      body += `--${boundary}\r\n`;
      body += 'Content-Disposition: form-data; name="workPerformed"\r\n\r\n';
      body += "Test\r\n";
      body += `--${boundary}\r\n`;
      body += 'Content-Disposition: form-data; name="conditionAfter"\r\n\r\n';
      body += "OK\r\n";
      body += `--${boundary}\r\n`;
      body += 'Content-Disposition: form-data; name="afterPhoto"; filename="test.jpg"\r\n';
      body += "Content-Type: image/jpeg\r\n\r\n";
      body += "data\r\n";
      body += `--${boundary}--\r\n`;

      const r = await request("POST", "/api/work-report", {
        token: TOKEN,
        headers: { "Content-Type": `multipart/form-data; boundary=${boundary}` },
        body,
      });
      assert(r.status === 400, `Expected 400, got ${r.status}`);
      return { pass: true };
    });

    // Test 16: Different worker
    await test("16. Unauthorized Worker Access (403)", async () => {
      // Seed another worker
      const seed2 = await request("POST", "/api/auth/seed", {
        body: { employeeId: "WB002", name: "Suresh", password: "pass456" },
      });
      const login2 = await request("POST", "/api/auth/login", {
        body: { employeeId: "WB002", password: "pass456" },
      });
      const token2 = login2.body.token;
      const r = await request("GET", `/api/complaints/${COMPLAINT_ID}`, { token: token2 });
      assert(r.status === 403, `Expected 403, got ${r.status}`);
      return { pass: true };
    });
  } else {
    console.log("\n  ⚠️  Full workflow tests (13–16) skipped — seed a complaint in MongoDB first.");
  }

  // ── Summary ──
  const passCount = results.filter((r) => r.pass).length;
  console.log(`\n📊 Results: ${passCount}/${results.length} passed\n`);
  
  for (const r of results) {
    console.log(`  ${r.pass ? "✅" : "❌"} ${r.name}`);
  }

  console.log(`\n${passCount === results.length ? "🎉 ALL TESTS PASSED" : "⚠️  SOME TESTS FAILED"}\n`);

  // Cleanup test workers
  try {
    const mongoose = require("mongoose");
    // Use same URI as .env — fallback to localhost if not set
    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/sahayog24x7";
    await mongoose.connect(uri);
    await mongoose.connection.db.collection("workers").deleteMany({ employeeId: { $in: ["WB001", "WB002"] } });
    await mongoose.connection.close();
  } catch {}

  process.exit(passCount === results.length ? 0 : 1);
}

// Check if server is up first
request("GET", "/api/health")
  .then((r) => {
    if (r.status === 200) return run();
    console.log("❌ Server not running on " + BASE + ". Start it with: cd backend && npm start");
    process.exit(1);
  })
  .catch(() => {
    console.log("❌ Server not running on " + BASE + ". Start it with: cd backend && npm start");
    process.exit(1);
  });
