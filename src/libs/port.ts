import net from "net";

/**
 * Check if a port is in use.
 * @param port - The port number to check.
 * @returns A promise that resolves to true if the port is in use, false otherwise.
 */
export const isPortInUse = (port: number): Promise<boolean> => {
	return new Promise((resolve) => {
		const server = net.createServer();
		server.once("error", (err: NodeJS.ErrnoException) => {
			if (err.code === "EADDRINUSE") {
				resolve(true);
			} else {
				resolve(false);
			}
		});
		server.once("listening", () => {
			server.close(() => resolve(false));
		});
		server.listen(port);
	});
};
