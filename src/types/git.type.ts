export interface IGitStatus {
	remoteOriginURL: string | null;
	currentBranch: string | null;
}

export interface IGitPullResult {
	success: boolean;
	message: string;
}
