import { checkConfigExist, initConfig } from "@/config/config";

export const ConfigInit = () => {
	if (!checkConfigExist()) {
		initConfig();
	}
	console.error("Configuration file is already existed.");
	process.exit(0);
};
