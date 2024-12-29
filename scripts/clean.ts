import * as fs from "fs";
import * as path from "path";

async function deleteDistDirectoryIfExists(): Promise<void> {
	const dirPath = path.join("dist");
	try {
		await fs.promises.access(dirPath);
		await fs.promises.rm(dirPath, { recursive: true });
		console.log("Directory ./dist has been deleted successfully.");
	} catch (error) {
		console.error("Error deleting directory ./dist:", error);
	}
}

deleteDistDirectoryIfExists().catch(console.error);
