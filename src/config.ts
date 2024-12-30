import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import type { IConfig } from "./types/config.type";

export const CONFIG_FILEPATH = path.join("git-auto-deploy.json");

const configSchema = z.object({
	PORT: z.number().default(3000),
	SECRET: z.string().nullable(),
	ACTIONS: z.array(z.string()).default([]),
	LOG_PATH: z.string().default("./logs"),
});

const loadConfig = (filePath: string) => {
	try {
		const fileContent = fs.readFileSync(filePath, "utf-8");
		const parsedContent = JSON.parse(fileContent);
		return configSchema.parse(parsedContent);
	} catch (error) {
		if (error instanceof z.ZodError) {
			console.error("Configuration validation failed.");
			for (const err of error.errors) {
				console.error(`- ${err.path.join(".")}: ${err.message}`);
			}
		} else {
			console.error("Error reading or parsing configuration file:", error);
		}
		process.exit(1);
	}
};

export const initConfig = () => {
	const config: IConfig = {
		PORT: 3300,
		ACTIONS: [],
		SECRET: null,
		LOG_PATH: "./logs",
	};

	fs.writeFileSync(CONFIG_FILEPATH, JSON.stringify(config, null, 2));
	console.log(`Configuration file is saved at ${path.resolve(CONFIG_FILEPATH)}.`);
	console.log("Now please edit it to set configuration.");
};

export const CONFIG = loadConfig(CONFIG_FILEPATH);

export const PORT = CONFIG.PORT;
export const LOG_PATH = CONFIG.LOG_PATH;
export const SECRET = CONFIG.SECRET;
export const ACTIONS = CONFIG.ACTIONS;
