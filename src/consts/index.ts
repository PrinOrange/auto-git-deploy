import { loadConfigFromFile } from "@/config";
import { join } from "node:path";

export const CONFIG_FILENAME = "git-auto-deploy.json";
export const { PORT, SECRET, ACTIONS, LOG_PATH } = loadConfigFromFile(CONFIG_FILENAME);
export const LOCALHOST_ADDRESS = `http:\/\/localhost:${PORT}\/`;
export const LOG_FILENAME = join(LOG_PATH, "git-auto-deploy.log");

export const MAX_LOG_SIZE = 10485760;
export const LOG_BACKUPS = 3;
