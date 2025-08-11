import { join } from "path";
import { existsSync } from "fs";

export function getEnvFilePath(): string {
  const env = process.env.NODE_ENV || "development";
  const rootPath = process.cwd();

  // Priority loading order:
  // 1. envs/.env.{NODE_ENV}
  // 2. envs/.env.dev (fallback for development)

  const envFile = join(rootPath, "envs", `.env.${env}`);
  const fallbackFile = join(rootPath, "envs", ".env.dev");

  if (existsSync(envFile)) {
    console.log(`[CONFIG] Loading environment from: envs/.env.${env}`);
    return envFile;
  }

  if (env === "development" && existsSync(fallbackFile)) {
    console.log(
      `[CONFIG] Environment file envs/.env.${env} not found, using fallback: envs/.env.dev`
    );
    return fallbackFile;
  }

  // For production, we should be strict about the file existence
  if (env === "production") {
    throw new Error(
      `Production environment file envs/.env.production is required but not found. ` +
        `Please create this file based on envs/.env.prod.example`
    );
  }

  throw new Error(
    `No environment file found. Please ensure envs/.env.${env} exists. ` +
      `For development, you can use envs/.env.dev as a starting point.`
  );
}
