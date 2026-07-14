import cors from "cors";
import express, { type Request, type Response } from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";

import v1Router from "./api/v1";
import { env } from "./core/config";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";

export const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(
  cors({
    origin: env.CORS_ORIGINS.length > 0 ? env.CORS_ORIGINS : "*",
    credentials: true,
  })
);
app.use(express.json());
if (env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Serves examiner-uploaded model-answer files (handwritten reference
// solutions). Swap for an S3/CDN-backed static route in production.
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/", (_req: Request, res: Response) => {
  res.json({ status: "ok", service: "AI-Proctored Exam Platform API" });
});

app.get(`${env.API_V1_PREFIX}/health`, (_req: Request, res: Response) => {
  res.json({ status: "healthy" });
});

app.use(env.API_V1_PREFIX, v1Router);

app.use(notFoundHandler);
app.use(errorHandler);
