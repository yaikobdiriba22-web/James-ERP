import express from "express";
import path from "path";
import { createApiRouter } from "./src/api/index";

const PORT = process.env.PORT || 3000;

const app = express();
app.use(createApiRouter());

const distPath = path.join(process.cwd(), "dist");
app.use(express.static(distPath));
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`James ERP server running on http://localhost:${PORT}`);
});
