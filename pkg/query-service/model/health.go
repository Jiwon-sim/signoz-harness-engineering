package model

// DiskInfo holds per-disk capacity read from the underlying DB (clickhouse system.disks).
type DiskInfo struct {
	Name       string `json:"name" ch:"name"`
	FreeBytes  uint64 `json:"free_bytes" ch:"free_space"`
	TotalBytes uint64 `json:"total_bytes" ch:"total_space"`
}

// CheckResult is the status of a single dependency in a detailed health response.
type CheckResult struct {
	Status string `json:"status"`          // "healthy" | "unhealthy" | "ok"
	Error  string `json:"error,omitempty"` // populated when the check fails

	// clickhouse check.
	LatencyMs *int64 `json:"latency_ms,omitempty"`

	// disk check.
	FreeBytes   *uint64  `json:"free_bytes,omitempty"`
	TotalBytes  *uint64  `json:"total_bytes,omitempty"`
	UsedPercent *float64 `json:"used_percent,omitempty"`
}

// DetailedHealth is the response for GET /api/v1/health?detailed.
type DetailedHealth struct {
	Status string                 `json:"status"` // "ok" | "degraded"
	Checks map[string]CheckResult `json:"checks"`
}
