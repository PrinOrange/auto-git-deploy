export interface IGitStatus {
	remoteOriginURL: string | null;
	currentBranch: string | null;
	isStagingAreaEmpty: boolean | null;
	unstagedFiles: string[];
}
