import { constants, accessSync } from "node:fs";

/**
 * Check whether is a file exist.
 * @param filePath - Filepath
 * @returns Whether is the file exist.
 */
export const fileExists = (filePath: string): boolean => {
	try {
		accessSync(filePath, constants.F_OK);
		return true;
	} catch {
		return false;
	}
};
