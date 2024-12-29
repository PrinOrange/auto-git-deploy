import crypto from "crypto";
import { GithubWebhookPayload } from "./types/payload.type";

/**
 * Verify GitHub webhook signature
 * @param secret - The GitHub webhook secret.
 * @param payload - The raw body of the webhook request (as a string).
 * @param signature - The value of the `X-Hub-Signature-256` header.
 * @returns `true` if the signature is valid, otherwise `false`.
 */
export function verifyGithubWebhook(secret: string, payload: GithubWebhookPayload, signature: string): boolean {
	if (!signature || !signature.startsWith("sha256=")) {
		return false;
	}

	// Remove the `sha256=` prefix from the signature
	const signatureHash = signature.slice(7);

	// Create HMAC using the secret and the payload
	const hmac = crypto.createHmac("sha256", secret);
	hmac.update(JSON.stringify(payload), "utf-8");
	const digest = hmac.digest("hex");

	// Compare the calculated digest with the signature in a timing-safe way
	return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signatureHash));
}
