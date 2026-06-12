package app

import (
	"context"
	"errors"
	"net/http"
	"testing"

	"github.com/SigNoz/signoz/pkg/query-service/model"
)

// fakeHealthChecker is a lightweight stand-in for the healthChecker subset of
// interfaces.Reader, used to drive buildDetailedHealth without a real ClickHouse.
type fakeHealthChecker struct {
	chErr   error
	disks   []model.DiskInfo
	diskErr *model.ApiError
}

func (f fakeHealthChecker) CheckClickHouse(_ context.Context) error { return f.chErr }

func (f fakeHealthChecker) GetDiskUsage(_ context.Context) ([]model.DiskInfo, *model.ApiError) {
	return f.disks, f.diskErr
}

func TestBuildDetailedHealth(t *testing.T) {
	tests := []struct {
		name           string
		hc             fakeHealthChecker
		wantStatus     string
		wantCode       int
		wantCHStatus   string
		wantDiskStatus string
	}{
		{
			name:           "all healthy",
			hc:             fakeHealthChecker{disks: []model.DiskInfo{{Name: "default", FreeBytes: 50, TotalBytes: 100}}},
			wantStatus:     "ok",
			wantCode:       http.StatusOK,
			wantCHStatus:   "healthy",
			wantDiskStatus: "ok",
		},
		{
			name:           "clickhouse down",
			hc:             fakeHealthChecker{chErr: errors.New("connection refused"), disks: []model.DiskInfo{{Name: "default", FreeBytes: 50, TotalBytes: 100}}},
			wantStatus:     "degraded",
			wantCode:       http.StatusServiceUnavailable,
			wantCHStatus:   "unhealthy",
			wantDiskStatus: "ok",
		},
		{
			name:           "disk nearly full",
			hc:             fakeHealthChecker{disks: []model.DiskInfo{{Name: "default", FreeBytes: 5, TotalBytes: 100}}},
			wantStatus:     "degraded",
			wantCode:       http.StatusServiceUnavailable,
			wantCHStatus:   "healthy",
			wantDiskStatus: "unhealthy",
		},
		{
			name:           "disk query error",
			hc:             fakeHealthChecker{diskErr: &model.ApiError{Typ: model.ErrorExec, Err: errors.New("query failed")}},
			wantStatus:     "degraded",
			wantCode:       http.StatusServiceUnavailable,
			wantCHStatus:   "healthy",
			wantDiskStatus: "unhealthy",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			health, code := buildDetailedHealth(context.Background(), tt.hc)

			if health.Status != tt.wantStatus {
				t.Errorf("overall status = %q, want %q", health.Status, tt.wantStatus)
			}
			if code != tt.wantCode {
				t.Errorf("http code = %d, want %d", code, tt.wantCode)
			}
			if got := health.Checks["clickhouse"].Status; got != tt.wantCHStatus {
				t.Errorf("clickhouse status = %q, want %q", got, tt.wantCHStatus)
			}
			if got := health.Checks["disk"].Status; got != tt.wantDiskStatus {
				t.Errorf("disk status = %q, want %q", got, tt.wantDiskStatus)
			}
		})
	}
}

// TestBuildDetailedHealthIncludesMetrics verifies the healthy path reports
// latency and disk usage details (REQ-1, REQ-2, REQ-3).
func TestBuildDetailedHealthIncludesMetrics(t *testing.T) {
	hc := fakeHealthChecker{disks: []model.DiskInfo{{Name: "default", FreeBytes: 40, TotalBytes: 100}}}

	health, _ := buildDetailedHealth(context.Background(), hc)

	ch := health.Checks["clickhouse"]
	if ch.LatencyMs == nil {
		t.Error("clickhouse check should include latency_ms")
	}
	disk := health.Checks["disk"]
	if disk.UsedPercent == nil || *disk.UsedPercent != 60 {
		t.Errorf("disk used_percent = %v, want 60", disk.UsedPercent)
	}
	if disk.FreeBytes == nil || *disk.FreeBytes != 40 {
		t.Errorf("disk free_bytes = %v, want 40", disk.FreeBytes)
	}
}
