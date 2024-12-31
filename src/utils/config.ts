import { CONFIG_FILENAME } from "@/consts/consts";
import { ConfigureError } from "@/error/ConfigError";
import { fileExists } from "@/libs/file";
import type { IConfig } from "@/types/config.type";
import { bold } from "colors";
import * as fs from "node:fs";
import * as path from "node:path";
import { z } from "zod";

export const createConfig = () => {
	try {
		const config: IConfig = {
			PORT: 3300,

			DEPLOY: "",
			STOP: null,

			BEFORE_PULL: [],
			AFTER_PULL: [],
			SECRET: null,
		};
		fs.writeFileSync(CONFIG_FILENAME, JSON.stringify(config, null, 2));
		console.log(`Configuration file is saved at ${path.resolve(CONFIG_FILENAME)}.`);
		console.log("Now please edit it to set configuration.");
		console.log(
			`${bold("DON NOT FORGET ADD FILE `autodeploy.config.json` AND directory `.autodeploy` TO .gitignore MANUALLY.")}`,
		);
	} catch (error) {
		throw new ConfigureError(`Error in setting configuration file ${CONFIG_FILENAME}: ${error}`);
	}
};

export const loadConfig = (): IConfig => {
	try {
		// Check if configuration file exists
		if (!fileExists(CONFIG_FILENAME)) {
			throw new ConfigureError(
				"Configuration file does not exist. Maybe you should run command 'autodeploy init' first.",
			);
		}

		// Define the schema
		const configSchema = z.object({
			PORT: z.number().default(3000),
			SECRET: z.string().nullable().default(null),

			DEPLOY: z.string().nullable().default(""),
			STOP: z.string().nullable().default(""),

			BEFORE_PULL: z.array(z.string()).default([]),
			AFTER_PULL: z.array(z.string()).default([]),
		});

		// Read and parse the configuration file
		const fileContent = fs.readFileSync(CONFIG_FILENAME, "utf-8");
		const parsedContent = JSON.parse(fileContent);
		return configSchema.parse(parsedContent);
	} catch (error) {
		// Handle schema validation errors
		if (error instanceof z.ZodError) {
			throw new ConfigureError(error.errors.map((err) => `- ${err.path.join(".")}: ${err.message}`).join("\n"));
		}
		if (error instanceof ConfigureError) {
			throw error;
		}
		// Handle other errors
		throw new ConfigureError(`Error reading or parsing configuration file: ${error}`);
	}
};
