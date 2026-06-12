// Mirrors backend pkg/query-service/model/health.go (DetailedHealth / CheckResult).

export interface CheckResult {
	status: string; // "healthy" | "unhealthy" | "ok"
	error?: string;
	// clickhouse
	latency_ms?: number;
	// disk
	free_bytes?: number;
	total_bytes?: number;
	used_percent?: number;
}

export interface DetailedHealth {
	status: string; // "ok" | "degraded"
	checks: {
		clickhouse?: CheckResult;
		disk?: CheckResult;
		[key: string]: CheckResult | undefined;
	};
}

export type PayloadProps = DetailedHealth;
