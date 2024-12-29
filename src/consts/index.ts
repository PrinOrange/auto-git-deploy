import { loadConfigFromFile } from "@/config";
import { join } from "path";

export const { PORT, SECRET, ACTIONS, LOG_PATH } = loadConfigFromFile("git-auto-deploy.json");
export const LOCALHOST_ADDRESS = `http:\/\/localhost:${PORT}\/`;
export const LOG_FILENAME = join(LOG_PATH, "git-auto-deploy.log");

export const MAX_LOG_SIZE = 10485760;
export const LOG_BACKUPS = 3;
