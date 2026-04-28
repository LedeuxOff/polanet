import { readFileSync, appendFileSync, mkdirSync, writeFileSync as fsWriteFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ERROR_LOG_DIR = join(__dirname, "../../logs");
const ERROR_LOG_FILE = join(ERROR_LOG_DIR, "errors.json");

export interface ServerError {
  id: number;
  timestamp: string;
  message: string;
  stack?: string;
  endpoint?: string;
  method?: string;
  appVersion?: string;
  userAgent?: string;
}

function getLastErrorId(): number {
  try {
    if (readFileSync(ERROR_LOG_FILE, "utf-8").trim()) {
      const errors = JSON.parse(readFileSync(ERROR_LOG_FILE, "utf-8")) as ServerError[];
      return errors.length > 0 ? Math.max(...errors.map((e) => e.id)) + 1 : 1;
    }
  } catch {
    // File doesn't exist or is empty
  }
  return 1;
}

function loadErrors(): ServerError[] {
  try {
    const content = readFileSync(ERROR_LOG_FILE, "utf-8");
    if (content.trim()) {
      return JSON.parse(content) as ServerError[];
    }
  } catch {
    // File doesn't exist or is empty
  }
  return [];
}

export function logError(errorData: Omit<ServerError, "id" | "timestamp">): ServerError {
  mkdirSync(ERROR_LOG_DIR, { recursive: true });

  const errors = loadErrors();
  const newError: ServerError = {
    ...errorData,
    id: getLastErrorId(),
    timestamp: new Date().toISOString(),
  };

  errors.push(newError);

  // Keep only last 1000 errors
  if (errors.length > 1000) {
    errors.splice(0, errors.length - 1000);
  }

  fsWriteFileSync(ERROR_LOG_FILE, JSON.stringify(errors, null, 2));

  return newError;
}

export function getErrors(): ServerError[] {
  return loadErrors();
}

export function getErrorsByAppVersion(appVersion: string): ServerError[] {
  return loadErrors().filter((error) => error.appVersion === appVersion);
}

export function clearErrors(): void {
  try {
    fsWriteFileSync(ERROR_LOG_FILE, "[]");
  } catch {
    // Ignore errors
  }
}
