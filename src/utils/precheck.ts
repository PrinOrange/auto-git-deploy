import { CONFIG_FILENAME, LOG_DIR } from "@/consts/consts";
import { isFileIgnoredByGit, isInGitRepo } from "@/libs/git";

export const precheck = () => {
	// Make sure the directory is in git repo before running program.
	// To avoid configuration loading problems.
	if (!isInGitRepo()) {
		console.error(`Current directory: ${process.cwd} is not a git repository.
  Please init or clone a git repository here.`);
		process.exit(1);
	}
	if (isFileIgnoredByGit(CONFIG_FILENAME) || isFileIgnoredByGit(LOG_DIR)) {
		console.log(`The configuration file ${CONFIG_FILENAME} or log directory ${LOG_DIR} is not added in .gitignore.
  Please add it into ignore-file before running the program.
  `);
		process.exit(1);
	}
};
