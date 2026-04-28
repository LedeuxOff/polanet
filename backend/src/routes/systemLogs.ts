import { Router, Request, Response } from "express";
import { authenticate } from "../middleware/auth";
import {
  logError,
  getErrors,
  getErrorsByAppVersion,
  clearErrors,
  type ServerError,
} from "../services/error-logger";

const router = Router();

interface AuthRequest extends Request {
  user?: { id: number; email: string; roleId: number };
}

// Get all errors
router.get("/errors", authenticate, (req: AuthRequest, res: Response) => {
  const appVersion = req.headers["x-app-version"] as string | undefined;

  let errors: ServerError[];
  if (appVersion) {
    errors = getErrorsByAppVersion(appVersion);
  } else {
    errors = getErrors();
  }

  res.json(errors);
});

// Log a new error
router.post("/errors", authenticate, (req: AuthRequest, res: Response) => {
  const { message, stack, endpoint, method, appVersion, userAgent } = req.body;

  if (!message) {
    res.status(400).json({ error: "Message is required" });
    return;
  }

  const error = logError({
    message,
    stack,
    endpoint,
    method,
    appVersion,
    userAgent,
  });

  res.status(201).json(error);
});

// Clear all errors
router.delete("/errors", authenticate, (req: AuthRequest, res: Response) => {
  clearErrors();
  res.status(204).end();
});

export default router;
