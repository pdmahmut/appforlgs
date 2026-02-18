require("dotenv").config();
const express = require("express");
const path = require("path");
const dashboardRoutes = require("./server/routes/dashboardRoutes");

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json());
app.use("/dashboard", dashboardRoutes);
app.get("/health", (req, res) => res.status(200).json({ ok: true }));

app.use(express.static(__dirname, {
  index: false,
}));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Web + API server running at http://localhost:${PORT}`);
});
