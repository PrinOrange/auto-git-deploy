import { checkConfigExist, initConfig } from "@/utils/config";

export const ConfigInit = () => {
	if (!checkConfigExist()) {
		initConfig();
	}
	console.error("Configuration file is already existed.");
	process.exit(0);
};
