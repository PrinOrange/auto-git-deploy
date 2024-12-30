import { join } from "node:path";
import { LOG_BACKUPS, LOG_DIR, LOG_FILENAME, MAX_LOG_SIZE } from "@/consts/consts";
import log4js from "log4js";

export const LOG_FILEPATH = join(LOG_DIR, LOG_FILENAME);

const logger = log4js.configure({
	appenders: {
		fileAppender: {
			type: "file",
			filename: LOG_FILEPATH,
			maxLogSize: MAX_LOG_SIZE,
			backups: LOG_BACKUPS,
			compress: true,
		},
		consoleAppender: {
			type: "console",
		},
	},
	categories: {
		default: {
			appenders: ["consoleAppender"],
			level: "info",
		},
		appOutput: {
			appenders: ["fileAppender", "consoleAppender"],
			level: "info",
		},
		webhookOutput: {
			appenders: ["fileAppender"],
			level: "info",
		},
		shellCommandOutput: {
			appenders: ["fileAppender"],
			level: "info",
		},
	},
});

export const appOutputLogger = logger.getLogger("appOutput");
export const webhookOutputLogger = logger.getLogger("webhookOutput");
export const shellCommandOutputLogger = logger.getLogger("shellCommandOutput");
export const defaultLogger = logger.getLogger();
