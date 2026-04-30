import { Request, Response, NextFunction } from "express";
import { logError } from "../services/error-logger";

// Wrapper to catch synchronous errors in route handlers
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => void) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

export function errorHandler(
  err: Error & { status?: number },
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  const appVersion = req.headers["x-app-version"] as string | undefined;
  const userAgent = req.headers["user-agent"] as string | undefined;

  // Log error to server
  logError({
    message: err.message,
    stack: err.stack,
    endpoint: req.path,
    method: req.method,
    appVersion,
    userAgent,
  });

  const status = err.status || 500;

  res.status(status).json({
    error: status === 500 ? "Внутренняя ошибка сервера" : err.message,
  });
}
