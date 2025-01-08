import type { Handler } from "express";
import type { IGithubWebhookPayload, IGithubWebhookRequestHeader } from "./payload.type";

export type WebhookRouter = (secret: string | null) => Handler;
export type WebhookEvent = (header: IGithubWebhookRequestHeader, payload: IGithubWebhookPayload) => void;
