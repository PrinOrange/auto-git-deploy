import type { IGitStatus } from "@/types/git.type";
import type { IGithubWebhookPayload, IGithubWebhookRequestHeader } from "@/types/payload.type";
import type { WebhookEvent, WebhookRouter } from "@/types/router.type";
import { appOutputLogger } from "@/utils/log";
import { bold, cyan, underline } from "colors";
import express from "express";

export class WebhookServer {
	private server;
	private port: number;
	private gitStatus: IGitStatus;
	private secret: string | null;
	constructor(gitStatus: IGitStatus, port: number, secret: string | null) {
		this.port = port;
		this.gitStatus = gitStatus;
		this.secret = secret;
		this.server = express();
		this.server.use(express.json());
		this.server.use(express.urlencoded({ extended: true }));
	}

	useRouter(path: string, handle: WebhookRouter): WebhookServer {
		this.server.post(path, handle(this.secret));
		return this;
	}

	useEvent(event: WebhookEvent) {
		this.server.post("/", (req, res) => {
			const header = req.headers as unknown as IGithubWebhookRequestHeader;
			const payload = req.body as IGithubWebhookPayload;
			event(header, payload);
		});
	}

	start(): WebhookServer {
		this.server.get("/", (_req, res) => {
			res.send("The server is running successfully.");
		});

		const LOCALHOST_ADDRESS = `http://localhost:${this.port}`;

		appOutputLogger.info(`Server started at ${LOCALHOST_ADDRESS}`);

		console.log("🚀 Server started Successfully...");
		console.log(`${bold("Running on local address:")} ${cyan(LOCALHOST_ADDRESS)}`);
		console.log(`${bold("Listening the remote repo:")} ${underline(this.gitStatus.remoteOriginURL!)}`);
		console.log(`${bold("Current branch:")} ${this.gitStatus!.currentBranch}`);
		console.log(`${bold("Server PID:")} ${process.pid}, ${bold("Runtime version:")} ${process.version}`);
		console.log("Next, use reverse proxy (such as nginx) to map your domain name to this address.");

		this.server.listen(this.port);

		return this;
	}
}
