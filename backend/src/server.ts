import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import authRoutes from "./routes/authRoutes";
import reportsRoutes from "./routes/reportsRoutes";
import sectionsRoutes from "./routes/sectionsRoutes";
import adminRoutes from "./routes/adminRoutes";
import configRoutes from "./routes/configRoutes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  }),
);
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/sections", sectionsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/config", configRoutes);

app.use(errorHandler);

app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on port ${env.port}`);
});
