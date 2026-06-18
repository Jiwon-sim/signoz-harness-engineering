#!/usr/bin/env node
// 하네스 검증 리마인더 hook (크로스플랫폼).
// 실행되면 .claude/hooks/hook.log 에 기록을 남기고(작동 확인용),
// 변경 파일 종류에 맞는 검증 리마인더를 stderr 로 출력한다. 비차단(exit 0).
const fs = require('fs');
const path = require('path');

let raw = '';
try { raw = fs.readFileSync(0, 'utf8'); } catch (_) {}
let data = {};
try { data = JSON.parse(raw || '{}'); } catch (_) {}

const event = data.hook_event_name || '';
const file = (data.tool_input && (data.tool_input.file_path || data.tool_input.path)) || '';

// 실행 증거 로그.
try {
  const logPath = path.join(process.cwd(), '.claude', 'hooks', 'hook.log');
  fs.appendFileSync(logPath, `${new Date().toISOString()} event=${event} file=${file}\n`);
} catch (_) {}

// 이벤트/파일 종류별 리마인더.
let msg;
if (event === 'Stop') {
  msg = '[harness] 종료 전 체크 — 빌드·린트·테스트를 실제로 수행했는가? 실패를 정직하게 보고했는가?';
} else if (/\.go$/.test(file)) {
  msg = '[harness] Go 변경 — make go-test, golangci-lint run 권장. 가능하면 실제 실행, 실패는 정직하게 보고.';
} else if (/\.(ts|tsx|js|jsx)$/.test(file)) {
  msg = '[harness] Frontend 변경 — pnpm tsgo, pnpm oxlint, pnpm jest 권장. 가능하면 실제 실행, 실패는 정직하게 보고.';
} else {
  msg = '[harness] 변경 후 검증 권장 — 관련 빌드·린트·테스트를 가능하면 실제 실행, 실패는 정직하게 보고. 검증 없이 성공 주장 금지.';
}
process.stderr.write(msg + '\n');
process.exit(0);
