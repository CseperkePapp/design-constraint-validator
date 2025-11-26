/**
 * Version banner utility
 * Displays DCV version info when validation runs
 */
/**
 * Print DCV version banner
 * Shows: DCV v{version} | {repo_url}
 */
export declare function printVersionBanner(options?: {
    quiet?: boolean;
}): void;
/**
 * Get version string for JSON output
 */
export declare function getVersionInfo(): {
    name: string;
    version: string;
    repository: string;
};
//# sourceMappingURL=version-banner.d.ts.map