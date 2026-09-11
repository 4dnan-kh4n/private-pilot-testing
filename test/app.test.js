const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const { createApp } = require("../server");

test("validates and persists the complete dummy account number", async () => {
  const app = createApp(":memory:");
  const created = await request(app).post("/api/applications").send({ name: "Adnan Khan", age: 21, accountNumber: "1234567890" });
  assert.equal(created.status, 201);
  assert.match(created.body.shareToken, /^[a-f0-9]{48}$/);

  const shared = await request(app).get(`/api/shared-applications/${created.body.shareToken}`);
  assert.equal(shared.status, 200);
  assert.equal(shared.body.name, "Adnan Khan");
  assert.equal(shared.body.accountNumber, "1234567890");

  const updated = await request(app).patch(`/api/applications/${created.body.id}`).send({ hireReason: "I learn quickly and build reliable software." });
  assert.equal(updated.status, 200);

  const records = await request(app).get("/api/applications");
  assert.equal(records.status, 200);
  assert.equal(records.body.length, 1);
  assert.equal(records.body[0].accountNumber, "1234567890");
});

test("rejects invalid input", async () => {
  const app = createApp(":memory:");
  const result = await request(app).post("/api/applications").send({ name: "A", age: 10, accountNumber: "12" });
  assert.equal(result.status, 400);
});
