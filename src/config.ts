import fs from "fs";
import { z } from "zod";

export const configSchema = z.object({
	port: z.number().default(3000),
	payloadURL: z.string().default("/webhook"),
	secret: z.string().nullable(),
	actions: z.array(z.string()).default([]),
});

export const loadConfigFromFile = (filePath: string) => {
	try {
		const fileContent = fs.readFileSync(filePath, "utf-8");
		const parsedContent = JSON.parse(fileContent);
		return configSchema.parse(parsedContent);
	} catch (error) {
		if (error instanceof z.ZodError) {
			console.error("Configuration validation failed:");
			error.errors.forEach((err) => {
				console.error(`- ${err.path.join(".")}: ${err.message}`);
			});
		} else {
			console.error("Error reading or parsing configuration file:", error);
		}
		process.exit(1);
	}
};
