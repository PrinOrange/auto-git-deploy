import type { IConfig } from "@/types/config.type";
import type { IGitStatus } from "@/types/git.type";
import type { WebhookRouter } from "@/types/router.type";
import { appOutputLogger } from "@/utils/log";
import { bold, cyan, underline } from "colors";
import express from "express";

export class WebhookServer {
	private server;
	private gitStatus: IGitStatus;
	private config: IConfig;

	constructor(gitStatus: IGitStatus, config: IConfig) {
		this.gitStatus = gitStatus;
		this.config = config;
		this.server = express();
		this.server.use(express.json());
		this.server.use(express.urlencoded({ extended: true }));
	}

	useRouter(webhookRouter: WebhookRouter): WebhookServer {
		this.server.post("/", webhookRouter(this.gitStatus, this.config));
		return this;
	}

	start(): WebhookServer {
		// Builtin Ping-pong router for webhook server.
		this.server.get("/ping", (_req, res) => {
			res.send("pong");
		});

		const LOCALHOST_ADDRESS = `http://localhost:${this.config.PORT}`;

		appOutputLogger.info(`Server started at ${LOCALHOST_ADDRESS}`);

		console.log("🚀 Server started Successfully...");
		console.log(`${bold("Running on local address:")} ${cyan(LOCALHOST_ADDRESS)}`);
		console.log(`${bold("Listening the remote repo:")} ${underline(this.gitStatus.remoteOriginURL!)}`);
		console.log(`${bold("Current branch:")} ${this.gitStatus!.currentBranch}`);
		console.log(`${bold("Server PID:")} ${process.pid}, ${bold("Runtime version:")} ${process.version}`);
		console.log("Next, use reverse proxy (such as nginx) to map your domain name to this address.");

		this.server.listen(this.config.PORT);

		return this;
	}
}
