import { ConfigureError } from "@/error/ConfigError";
import { appOutputLogger } from "@/utils/log";
import { ConfigInit } from "./init";

export const handleInitCommand = () => {
	try {
		ConfigInit();
	} catch (error) {
		if (error instanceof ConfigureError) {
			appOutputLogger.error(error.message);
		}
		process.exit(1);
	}
};
