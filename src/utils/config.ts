import { CONFIG_FILENAME } from "@/consts/consts";
import { fileExists } from "@/libs/file";
import type { IConfig } from "@/types/config.type";
import { bold } from "colors";
import fs from "node:fs";
import path from "node:path";

export const checkConfigExist = () => {
	if (!fileExists(CONFIG_FILENAME)) {
		console.error("Configuration file does not exist.");
		console.error("Maybe you should run command 'autodeploy init' first.");
		return false;
	}
	return true;
};

export const initConfig = () => {
	const config: IConfig = {
		PORT: 3300,
		ACTIONS: [],
		SECRET: null,
		LOG_PATH: "./logs",
	};

	fs.writeFileSync(CONFIG_FILENAME, JSON.stringify(config, null, 2));
	console.log(`Configuration file is saved at ${path.resolve(CONFIG_FILENAME)}.`);
	console.log("Now please edit it to set configuration.");
	console.log(`After that ${bold("DON NOT FORGET add it to .gitignore file")})`);
};
