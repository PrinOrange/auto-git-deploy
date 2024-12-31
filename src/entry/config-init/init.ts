import { CONFIG_FILENAME } from "@/consts/consts";
import { ConfigureError } from "@/error/ConfigError";
import { fileExists } from "@/libs/file";
import { createConfig } from "@/utils/config";

export const ConfigInit = () => {
	if (!fileExists(CONFIG_FILENAME)) {
		createConfig();
	} else {
		throw new ConfigureError("Configuration file is already existed.");
	}
};
