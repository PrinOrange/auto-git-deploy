import log4js from "log4js";
import { LOG_BACKUPS, LOG_FILENAME, MAX_LOG_SIZE } from "./consts";

log4js.configure({
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
		serverOutput: {
			appenders: ["fileAppender"],
			level: "info",
		},
		commandOutput: {
			appenders: ["fileAppender"],
			level: "info",
		},
	},
});

export const appOutputLogger = log4js.getLogger("appOutput");
export const serverOutputLogger = log4js.getLogger("serverOutput");
export const commandOutputLogger = log4js.getLogger("commandOutput");
export const defaultLogger = log4js.getLogger();
