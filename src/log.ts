import log4js from "log4js";
import { join } from "node:path";
import { LOG_PATH } from "./config";

export const LOG_FILENAME = join(LOG_PATH, "git-auto-deploy.log");

export const MAX_LOG_SIZE = 10485760;
export const LOG_BACKUPS = 3;

const logger = log4js.configure({
	appenders: {
		fileAppender: {
			type: "file",
			filename: LOG_FILENAME,
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
