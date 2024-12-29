import fs from "node:fs";
import { z } from "zod";

export const configSchema = z.object({
	PORT: z.number().default(3000),
	SECRET: z.string().nullable(),
	ACTIONS: z.array(z.string()).default([]),
	LOG_PATH: z.string().default("./logs"),
});

export const loadConfigFromFile = (filePath: string) => {
	try {
		const fileContent = fs.readFileSync(filePath, "utf-8");
		const parsedContent = JSON.parse(fileContent);
		return configSchema.parse(parsedContent);
	} catch (error) {
		if (error instanceof z.ZodError) {
			console.error("Configuration validation failed:");
			for (const err of error.errors) {
				console.error(`- ${err.path.join(".")}: ${err.message}`);
			}
		} else {
			console.error("Error reading or parsing configuration file:", error);
		}
		process.exit(1);
	}
};
