import { fileExists } from "@/libs/file";
import * as fs from "fs";

export function updateGitignore(): void {
	const entries = ["# Autodeployee related files and directories", "autodeployee.config.json", ".autodeployee"];

	if (!fileExists(".gitignore")) {
		console.error(`Error: .gitignore file does not exist.`);
		return;
	}

	const currentContent = fs.readFileSync(".gitignore", "utf-8");
	const newEntries = entries.filter((entry) => !currentContent.includes(entry));

	if (newEntries.length > 0) {
		const updatedContent = `${currentContent.trim()}\n
${newEntries.join("\n")}
`;
		fs.writeFileSync(".gitignore", updatedContent, "utf-8");
		console.log("Updated .gitignore with AutoDeployee entries.");
	} else {
		console.log("No changes needed; AutoDeployee entries already exist in .gitignore.");
	}
}
