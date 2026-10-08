require("dotenv").config();

const pool = require("./db");
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/issues", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM issues ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not load issues" });
  }
});

app.post("/api/issues", async (req, res) => {
  const { title, description = "" } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: "Title is required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO issues (title, description) VALUES ($1, $2) RETURNING *",
      [title.trim(), description]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not create issue" });
  }
});

app.patch("/api/issues/:id", async (req, res) => {
  const { status } = req.body;
  const allowedStatuses = ["To do", "In progress", "Done"];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    const result = await pool.query(
      "UPDATE issues SET status = $1 WHERE id = $2 RETURNING *",
      [status, req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Issue not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not update issue" });
  }
});



app.listen(3001, () => {
  console.log("API server listening on http://localhost:3001");
});