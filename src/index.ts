// src/index.ts
import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes.js";

const app = express();

// CORS configuration for cross-origin deployment
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  // @ts-expect-error: patching Express' res.json at runtime
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    // @ts-expect-error: calling original method with same args
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        try {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        } catch {
          /* ignore */
        }
      }
      if (logLine.length > 80) logLine = logLine.slice(0, 79) + "…";
      console.log(logLine);
    }
  });

  next();
});

// ⬇️ Make sure routes are registered before export
await registerRoutes(app);

// Error handler (after routes)
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
  // In production/serverless, avoid throwing to keep clean logs
  if (process.env.NODE_ENV !== "production") {
    // rethrow in dev to see stack
    // eslint-disable-next-line no-unsafe-finally
    throw err;
  }
});

// ✅ Export the Express app for Vercel (production)
export default app;

// ✅ Local dev server only
if (process.env.NODE_ENV !== "production") {
  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    console.log(`Backend API server listening on http://localhost:${port}`);
  });
}