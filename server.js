require("dotenv").config();
const path = require("path");
const crypto = require("crypto");
const express = require("express");
const helmet = require("helmet");
const { connectDatabase } = require("./src/db");
const Application = require("./src/models/Application");

function createApp(dependencies = {}) {
  const Model = dependencies.Application || Application;
  const connect = dependencies.connectDatabase || connectDatabase;
  const app = express();
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(express.json({ limit: "20kb" }));
  app.use(express.static(path.join(__dirname, "public")));
  app.use("/api", async (_req, _res, next) => {
    try { await connect(); next(); } catch (error) { next(error); }
  });

  app.post("/api/applications", async (req, res, next) => {
    try {
      const name = String(req.body.name || "").trim();
      const age = Number(req.body.age);
      const accountNumber = String(req.body.accountNumber || "").replace(/\s|-/g, "");
      if (name.length < 2 || name.length > 80) return res.status(400).json({ message: "Enter a valid name (2–80 characters)." });
      if (!Number.isInteger(age) || age < 16 || age > 100) return res.status(400).json({ message: "Enter an age between 16 and 100." });
      if (!/^\d{6,18}$/.test(accountNumber)) return res.status(400).json({ message: "Use 6–18 digits for the demo account number." });

      const shareToken = crypto.randomBytes(24).toString("hex");
      const record = await Model.create({ shareToken, name, age, accountNumber });
      res.status(201).json({ id: String(record._id), shareToken, shareUrl: `/application.html?token=${shareToken}` });
    } catch (error) { next(error); }
  });

  app.patch("/api/shared-applications/:token", async (req, res, next) => {
    try {
      const hireReason = String(req.body.hireReason || "").trim();
      if (hireReason.length < 10 || hireReason.length > 500) return res.status(400).json({ message: "Your answer must contain 10–500 characters." });
      const record = await Model.findOneAndUpdate({ shareToken: req.params.token }, { hireReason }, { new: true });
      if (!record) return res.status(404).json({ message: "Shared application not found." });
      res.json({ message: "Application submitted successfully." });
    } catch (error) { next(error); }
  });

  app.get("/api/shared-applications/:token", async (req, res, next) => {
    try {
      const record = await Model.findOne({ shareToken: req.params.token }).lean();
      if (!record) return res.status(404).json({ message: "This shared application link is invalid." });
      res.json({
        id: String(record._id), name: record.name, age: record.age,
        accountNumber: record.accountNumber, hireReason: record.hireReason,
        createdAt: record.createdAt
      });
    } catch (error) { next(error); }
  });

  app.use((err, _req, res, _next) => {
    console.error(err);
    const configurationError = err.message === "MONGODB_URI is not configured.";
    res.status(configurationError ? 503 : 500).json({
      message: configurationError ? "Database is not configured." : "Something went wrong. Please try again."
    });
  });
  return app;
}

const app = createApp();
if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  app.listen(port, () => console.log(`App running at http://localhost:${port}`));
}

module.exports = app;
module.exports.createApp = createApp;
