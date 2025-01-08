import { CONFIG_FILENAME } from "@/consts/consts";
import { fileExists } from "@/libs/file";
import { createConfig } from "@/utils/config";
import { updateGitignore } from "@/utils/gitignore";
import { appOutputLogger } from "@/utils/log";

export const ConfigInit = () => {
	if (!fileExists(CONFIG_FILENAME)) {
		createConfig();
		updateGitignore();
		process.exit(0);
	}
	appOutputLogger.error("Configuration file is already existed.");
	process.exit(1);
};
