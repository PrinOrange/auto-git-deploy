import crypto from "node:crypto";

/**
 * Verify GitHub webhook signature
 * @param secret - The GitHub webhook secret.
 * @param requestBody - The raw body of the webhook request (as a string).
 * @param signature - The value of the `X-Hub-Signature-256` header.
 * @returns `true` if the signature is valid, otherwise `false`.
 */
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function verifyRequestSignature(requestBody: any, secret: string, signature: string): boolean {
	if (secret == null) {
		return true;
	}
	if (!signature || !signature.startsWith("sha256=")) {
		return false;
	}

	try {
		// Remove the `sha256=` prefix from the signature
		const signatureHash = signature.slice(7);

		// Create HMAC using the secret and the payload
		const hmac = crypto.createHmac("sha256", secret);
		hmac.update(JSON.stringify(requestBody), "utf-8");
		const digest = hmac.digest("hex");

		// Compare the calculated digest with the signature in a timing-safe way
		return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signatureHash));
	} catch (error) {
		return false;
	}
}
