const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

function loadEnvFile() {
  const envPath = path.join(__dirname, "../../.env.test");

  if (!fs.existsSync(envPath)) {
    return;
  }

  const envContent = fs.readFileSync(envPath, "utf8");

  envContent.split("\n").forEach((line) => {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith("#")) {
      return;
    }

    const [key, ...valueParts] = trimmedLine.split("=");
    const value = valueParts.join("=");

    if (key && value && !process.env[key]) {
      process.env[key] = value;
    }
  });
}

loadEnvFile();

const SUPABASE_URL = (process.env.SUPABASE_URL || "")
  .trim()
  .replace(/^SUPABASE_URL\s*=\s*/i, "")
  .replace(/\/rest\/v1\/?$/i, "")
  .replace(/\/$/, "");

const SUPABASE_ANON_KEY = (process.env.SUPABASE_ANON_KEY || "")
  .trim()
  .replace(/^SUPABASE_ANON_KEY\s*=\s*/i, "");

async function fetchDetections(limit = 1) {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/detections?select=id,lat,lng,location_text,severity,confidence,source,status&limit=${limit}`,
    {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Accept: "application/json",
      },
    }
  );

  return response;
}

test("Supabase environment variables should exist", () => {
  assert.ok(SUPABASE_URL, "SUPABASE_URL is missing");
  assert.ok(SUPABASE_ANON_KEY, "SUPABASE_ANON_KEY is missing");
  assert.ok(
    SUPABASE_URL.startsWith("https://"),
    "SUPABASE_URL should start with https://"
  );
});

test("detections table should be readable", async () => {
  const response = await fetchDetections(1);

  if (response.status !== 200) {
    const errorBody = await response.text();

    assert.fail(
      `Expected status 200 but got ${response.status}. Body: ${errorBody}`
    );
  }

  const data = await response.json();

  assert.ok(Array.isArray(data), "Response should be an array");
});

test("detections table should contain required columns", async (t) => {
  const response = await fetchDetections(1);
  const data = await response.json();

  if (data.length === 0) {
    t.skip("No rows found to validate columns");
    return;
  }

  const row = data[0];

  assert.ok("id" in row, "id column is missing");
  assert.ok("lat" in row, "lat column is missing");
  assert.ok("lng" in row, "lng column is missing");
  assert.ok("location_text" in row, "location_text column is missing");
  assert.ok("severity" in row, "severity column is missing");
  assert.ok("confidence" in row, "confidence column is missing");
  assert.ok("source" in row, "source column is missing");
  assert.ok("status" in row, "status column is missing");
});

test("lat and lng should be numbers", async (t) => {
  const response = await fetchDetections(1);
  const data = await response.json();

  if (data.length === 0) {
    t.skip("No rows found to validate lat/lng");
    return;
  }

  const row = data[0];

  assert.strictEqual(typeof row.lat, "number", "lat should be number");
  assert.strictEqual(typeof row.lng, "number", "lng should be number");
});

test("severity should be valid", async (t) => {
  const response = await fetchDetections(1);
  const data = await response.json();

  if (data.length === 0) {
    t.skip("No rows found to validate severity");
    return;
  }

  const row = data[0];
  const allowedSeverities = ["low", "medium", "high"];

  assert.ok(
    allowedSeverities.includes(String(row.severity).toLowerCase()),
    "severity should be low, medium, or high"
  );
});

test("should insert, fetch, and delete a test detection record", async () => {
  const testId = crypto.randomUUID();

  const testDetection = {
    id: testId,
    lat: 31.5204,
    lng: 74.3587,
    location_text: "Automation Test Location",
    severity: "low",
    confidence: 0.85,
    source: "user_upload",
    status: "approved",
  };

  try {
    const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/detections`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(testDetection),
    });

    const insertBody = await insertResponse.text();

    assert.strictEqual(
      insertResponse.status,
      201,
      `Insert failed. Status: ${insertResponse.status}, Body: ${insertBody}`
    );

    const insertedData = JSON.parse(insertBody);

    assert.ok(Array.isArray(insertedData), "Inserted response should be array");
    assert.strictEqual(insertedData[0].id, testId);
    assert.strictEqual(insertedData[0].location_text, "Automation Test Location");
    assert.strictEqual(insertedData[0].confidence, 0.85);
    assert.strictEqual(insertedData[0].source, "user_upload");
    assert.strictEqual(insertedData[0].status, "approved");

    const fetchResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/detections?id=eq.${testId}&select=id,lat,lng,location_text,severity,confidence,source,status`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          Accept: "application/json",
        },
      }
    );

    assert.strictEqual(fetchResponse.status, 200);

    const fetchedData = await fetchResponse.json();

    assert.strictEqual(fetchedData.length, 1, "Inserted record should be fetched");
    assert.strictEqual(fetchedData[0].id, testId);
    assert.strictEqual(fetchedData[0].severity, "low");
    assert.strictEqual(fetchedData[0].confidence, 0.85);
    assert.strictEqual(fetchedData[0].source, "user_upload");
    assert.strictEqual(fetchedData[0].status, "approved");
  } finally {
    const deleteResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/detections?id=eq.${testId}`,
      {
        method: "DELETE",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          Prefer: "return=representation",
        },
      }
    );

    assert.ok(
      deleteResponse.status === 200 || deleteResponse.status === 204,
      `Delete failed. Status: ${deleteResponse.status}`
    );
  }

  const verifyDeleteResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/detections?id=eq.${testId}&select=id`,
    {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Accept: "application/json",
      },
    }
  );

  assert.strictEqual(verifyDeleteResponse.status, 200);

  const deletedCheckData = await verifyDeleteResponse.json();

  assert.strictEqual(
    deletedCheckData.length,
    0,
    "Test record should be deleted after automation test"
  );
});