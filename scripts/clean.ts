import * as fs from "node:fs";
import * as path from "node:path";

async function deleteDistDirectoryIfExists(): Promise<void> {
	const distPath = path.join("dist");
	try {
		await fs.promises.access(distPath);
		await fs.promises.rm(distPath, { recursive: true });
	} catch (error) {
		console.error("Error deleting directory ./dist:", error);
	}
}

deleteDistDirectoryIfExists()
	.then(() => console.log("Directory ./dist has been deleted successfully."))
	.catch(console.error);
