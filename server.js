const path = require("path");
const fs = require("fs");
const express = require("express");
const helmet = require("helmet");
const crypto = require("crypto");

function createStore(file) {
  let memory = [];
  if (file !== ":memory:") {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    if (!fs.existsSync(file)) fs.writeFileSync(file, "[]\n");
  }
  return {
    read: () => file === ":memory:" ? memory : JSON.parse(fs.readFileSync(file, "utf8")),
    write: rows => file === ":memory:" ? (memory = rows) : fs.writeFileSync(file, `${JSON.stringify(rows, null, 2)}\n`)
  };
}

function createApp(file = path.join(__dirname, "data", "applications.json")) {
  const store = createStore(file);
  const app = express();
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(express.json({ limit: "20kb" }));
  app.use(express.static(path.join(__dirname, "public")));

  app.post("/api/applications", (req, res) => {
    const name = String(req.body.name || "").trim();
    const age = Number(req.body.age);
    const number = String(req.body.accountNumber || "").replace(/\s|-/g, "");
    if (name.length < 2 || name.length > 80) return res.status(400).json({ message: "Enter a valid name (2–80 characters)." });
    if (!Number.isInteger(age) || age < 16 || age > 100) return res.status(400).json({ message: "Enter an age between 16 and 100." });
    if (!/^\d{6,18}$/.test(number)) return res.status(400).json({ message: "Use 6–18 digits for the demo account number." });
    const rows = store.read();
    const id = rows.length ? Math.max(...rows.map(row => row.id)) + 1 : 1;
    const accountNumber = number;
    const shareToken = crypto.randomBytes(24).toString("hex");
    rows.push({ id, shareToken, name, age, accountNumber, hireReason: "", createdAt: new Date().toISOString() });
    store.write(rows);
    res.status(201).json({ id, shareToken, shareUrl: `/application.html?token=${shareToken}` });
  });

  app.patch("/api/applications/:id", (req, res) => {
    const id = Number(req.params.id);
    const hireReason = String(req.body.hireReason || "").trim();
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: "Invalid application ID." });
    if (hireReason.length < 10 || hireReason.length > 500) return res.status(400).json({ message: "Your answer must contain 10–500 characters." });
    const rows = store.read();
    const row = rows.find(item => item.id === id);
    if (!row) return res.status(404).json({ message: "Application not found." });
    row.hireReason = hireReason;
    store.write(rows);
    res.json({ message: "Application submitted successfully." });
  });

  app.patch("/api/shared-applications/:token", (req, res) => {
    const hireReason = String(req.body.hireReason || "").trim();
    if (hireReason.length < 10 || hireReason.length > 500) return res.status(400).json({ message: "Your answer must contain 10–500 characters." });
    const rows = store.read();
    const row = rows.find(item => item.shareToken === req.params.token);
    if (!row) return res.status(404).json({ message: "Shared application not found." });
    row.hireReason = hireReason;
    store.write(rows);
    res.json({ message: "Application submitted successfully." });
  });

  const safe = row => ({ id: row.id, name: row.name, age: row.age, hireReason: row.hireReason, createdAt: row.createdAt, accountNumber: row.accountNumber });
  app.get("/api/applications", (_req, res) => res.json(store.read().slice(-100).reverse().map(safe)));
  app.get("/api/applications/:id", (req, res) => {
    const row = store.read().find(item => item.id === Number(req.params.id));
    if (!row) return res.status(404).json({ message: "Application not found." });
    res.json(safe(row));
  });
  app.get("/api/shared-applications/:token", (req, res) => {
    const row = store.read().find(item => item.shareToken === req.params.token);
    if (!row) return res.status(404).json({ message: "This shared application link is invalid." });
    res.json(safe(row));
  });
  app.use((err, _req, res, _next) => { console.error(err); res.status(500).json({ message: "Something went wrong. Please try again." }); });
  return app;
}

if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  createApp().listen(port, () => console.log(`App running at http://localhost:${port}`));
}
module.exports = { createApp };
