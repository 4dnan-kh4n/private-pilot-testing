const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const { createApp } = require("../server");

function testApp() {
  const rows = [];
  const Application = {
    async create(data) {
      const row = { ...data, _id: String(rows.length + 1), hireReason: "", createdAt: new Date() };
      rows.push(row);
      return row;
    },
    async findOneAndUpdate(query, update) {
      const row = rows.find(item => item.shareToken === query.shareToken);
      if (row) Object.assign(row, update);
      return row || null;
    },
    findOne(query) {
      return { lean: async () => rows.find(item => item.shareToken === query.shareToken) || null };
    }
  };
  return createApp({ Application, connectDatabase: async () => {} });
}

test("creates a share token and retrieves the complete dummy number", async () => {
  const app = testApp();
  const created = await request(app).post("/api/applications").send({ name: "Adnan Khan", age: 21, accountNumber: "1234567890" });
  assert.equal(created.status, 201);
  assert.match(created.body.shareToken, /^[a-f0-9]{48}$/);
  assert.equal(created.body.shareUrl, `/application.html?token=${created.body.shareToken}`);
  const shared = await request(app).get(`/api/shared-applications/${created.body.shareToken}`);
  assert.equal(shared.status, 200);
  assert.equal(shared.body.accountNumber, "1234567890");
  const updated = await request(app).patch(`/api/shared-applications/${created.body.shareToken}`).send({ hireReason: "I learn quickly and build reliable software." });
  assert.equal(updated.status, 200);
});

test("rejects invalid input", async () => {
  const result = await request(testApp()).post("/api/applications").send({ name: "A", age: 10, accountNumber: "12" });
  assert.equal(result.status, 400);
});
