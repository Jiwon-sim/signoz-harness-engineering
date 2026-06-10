# Harness PreToolUse guard - block direct edits to generated / lock files.
# Input: JSON on stdin (contains tool_input.file_path). On block: exit 2 + stderr message.
# Related steering: structure.md (no manual edits to generated artifacts), frontend-react.md (api/generated).
# NOTE: ASCII-only on purpose. Windows PowerShell 5.1 reads UTF-8-no-BOM as the system
#       code page, so non-ASCII here would corrupt the parse.

$ErrorActionPreference = 'Stop'

$raw = [Console]::In.ReadToEnd()
if ([string]::IsNullOrWhiteSpace($raw)) { exit 0 }

try {
    $data = $raw | ConvertFrom-Json
} catch {
    exit 0
}

$fp = $data.tool_input.file_path
if ([string]::IsNullOrWhiteSpace($fp)) { exit 0 }

# Normalize path (backslash -> slash).
$norm = ($fp -replace '\\', '/')

# Protected: do not edit directly (generated / lock files).
$protected = @(
    '/frontend/src/api/generated/',
    '/frontend/src/types/generated/',
    '/pnpm-lock.yaml',
    '/go.sum'
)

foreach ($p in $protected) {
    if ($norm -like "*$p*") {
        [Console]::Error.WriteLine("[harness guard] '$fp' is a generated/lock file. Do not edit it directly.")
        [Console]::Error.WriteLine("  -> Schema change: 'pnpm generate:api'. Deps: use pnpm / go mod. (steering: structure.md)")
        exit 2
    }
}

exit 0
