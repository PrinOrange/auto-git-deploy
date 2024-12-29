import fs from "node:fs";
import { z } from "zod";
import { appOutputLogger } from "./log";

const configSchema = z.object({
	PORT: z.number().default(3000),
	SECRET: z.string().nullable(),
	ACTIONS: z.array(z.string()).default([]),
	LOG_PATH: z.string().default("./logs"),
});

const loadConfigFromFile = (filePath: string) => {
	try {
		const fileContent = fs.readFileSync(filePath, "utf-8");
		const parsedContent = JSON.parse(fileContent);
		return configSchema.parse(parsedContent);
	} catch (error) {
		if (error instanceof z.ZodError) {
			appOutputLogger.error("Configuration validation failed.");
			for (const err of error.errors) {
				appOutputLogger.error(`- ${err.path.join(".")}: ${err.message}`);
			}
		} else {
			appOutputLogger.error("Error reading or parsing configuration file:", error);
		}
		process.exit(1);
	}
};

export const CONFIG_FILENAME = "git-auto-deploy.json";
export const CONFIG = loadConfigFromFile(CONFIG_FILENAME);

export const PORT = CONFIG.PORT;
export const LOG_PATH = CONFIG.LOG_PATH;
export const SECRET = CONFIG.SECRET;
export const ACTIONS = CONFIG.ACTIONS;
