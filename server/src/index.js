require("./config/env");

const express = require("express");
const cors = require("cors");

const taskRoutes = require("./routes/task.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1/tasks", taskRoutes);

// Middleware global de manejo de errores
app.use((err, req, res, next) => {
  if (err instanceof Error && err.message === "NOT_FOUND") {
    return res.status(404).json({ error: "Task not found." });
  }
  console.error(err);
  return res.status(500).json({ error: "Error interno del servidor" });
});

app.listen(process.env.PORT, () => {
  console.log(`Servidor en puerto ${process.env.PORT}`);
});