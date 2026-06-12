#!/usr/bin/env npx tsx
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const repoRoot = process.cwd();
const tasksDir = path.resolve(repoRoot, 'docs/project-management/tasks');
const readmePath = path.join(tasksDir, 'README.md');

// Optional, non-binding agent-assignment marker that may appear in a task
// filename and H1 title right after the number, e.g. TASK-042-CLAUDE-name.md
// / "# Task 042 CLAUDE: Name". It records the *preferred* agent only — any
// agent may still implement the task. Keep this list uppercase.
export const AGENT_MARKERS = ['CLAUDE', 'CODEX'] as const;
export type AgentMarker = (typeof AGENT_MARKERS)[number];

const agentMarkerAlternation = AGENT_MARKERS.join('|');
const taskFilenamePattern = new RegExp(
  `^(?:DONE-|DEPR-)?TASK-(\\d+(?:\\.\\d+)?)(?:-(${agentMarkerAlternation}))?(?:-.+)?\\.md$`,
  'u',
);
const taskLinkPattern = /\]\([^)]*(?:DONE-|DEPR-)?TASK-[^)]+\.md\)/u;

export interface ParsedTaskFilename {
  id: string;
  agent: AgentMarker | null;
}

/**
 * Parse a task filename into its id and optional agent-assignment marker.
 * Returns null for names that are not task files. The marker is a soft
 * preference, so an absent or unrecognized marker simply yields `agent: null`
 * (an unrecognized leading token is treated as part of the task name).
 */
export function parseTaskFilename(filename: string): ParsedTaskFilename | null {
  const match = filename.match(taskFilenamePattern);
  if (!match) {
    return null;
  }
  return { id: match[1], agent: (match[2] as AgentMarker | undefined) ?? null };
}

export interface TaskHeader {
  id: string;
  status: string;
  filename: string;
  agent?: AgentMarker | null;
}

export interface SyncChange {
  file: string;
  line: number;
  detail: string;
}

export interface StatusRule {
  desired: string;
  accepted: Set<string>;
}

interface Allowlist {
  readmeStatusVariants?: Record<string, string[]>;
  parentTableStatusVariants?: Record<string, string[]>;
}

const allowlistPath = path.resolve(repoRoot, 'src/__tests__/task-workflow-integrity.allowlist.json');

export function normalizeText(value: string): string {
  return value.normalize('NFKC').replace(/\s+/gu, ' ').trim();
}

function normalizeIdCell(value: string): string {
  return normalizeText(value).replace(/[*`]/gu, '');
}

export function extractField(content: string, fieldName: string): string | null {
  const match = content.match(new RegExp(`^\\*\\*${fieldName}:\\*\\*\\s*(.+)$`, 'imu'));
  return match?.[1]?.trim() ?? null;
}

function splitTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/u, '')
    .replace(/\|$/u, '')
    .split('|')
    .map((cell) => cell.trim());
}

function isSeparatorRow(line: string): boolean {
  return /^\|(?:\s*:?[-]{2,}:?\s*\|)+\s*$/u.test(line.trim());
}

function buildRow(cells: string[]): string {
  return `| ${cells.join(' | ')} |`;
}

export function loadTaskHeaders(dir: string = tasksDir): TaskHeader[] {
  const headers: TaskHeader[] = [];

  for (const filename of readdirSync(dir)) {
    const parsed = parseTaskFilename(filename);
    if (!parsed) {
      continue;
    }

    const filePath = path.join(dir, filename);
    if (!statSync(filePath).isFile()) {
      continue;
    }

    const status = extractField(readFileSync(filePath, 'utf8'), 'Status');
    if (!status) {
      throw new Error(`Missing Status header: ${filename}`);
    }

    headers.push({ id: parsed.id, status, filename, agent: parsed.agent });
  }

  return headers;
}

export function computeNextTaskNumber(headers: TaskHeader[]): string {
  const topLevel = headers
    .filter((header) => !header.id.includes('.'))
    .map((header) => Number.parseInt(header.id, 10))
    .filter((value) => Number.isFinite(value));

  const next = topLevel.length > 0 ? Math.max(...topLevel) + 1 : 1;
  return String(next).padStart(3, '0');
}

export function syncStatusCells(
  content: string,
  rulesById: Map<string, StatusRule>,
  fileLabel: string,
): { content: string; changes: SyncChange[] } {
  const lines = content.split(/\r?\n/u);
  const changes: SyncChange[] = [];

  for (let index = 0; index < lines.length - 1; index++) {
    if (!lines[index].trim().startsWith('|') || !isSeparatorRow(lines[index + 1])) {
      continue;
    }

    const headers = splitTableRow(lines[index]).map((header) => normalizeText(header).toLowerCase());
    const statusIndex = headers.indexOf('status');
    let rowIndex = index + 2;

    for (; rowIndex < lines.length && lines[rowIndex].trim().startsWith('|'); rowIndex++) {
      if (statusIndex === -1) {
        continue;
      }

      const cells = splitTableRow(lines[rowIndex]);
      const id = normalizeIdCell(cells[0] ?? '');
      const rule = rulesById.get(id);
      if (!rule || !/^\d+(?:\.\d+)?$/u.test(id)) {
        continue;
      }

      if (!taskLinkPattern.test(lines[rowIndex])) {
        continue;
      }

      const current = cells[statusIndex] ?? '';
      if (rule.accepted.has(normalizeText(current))) {
        continue;
      }

      cells[statusIndex] = rule.desired;
      lines[rowIndex] = buildRow(cells);
      changes.push({ file: fileLabel, line: rowIndex + 1, detail: `${id}: "${current}" → "${rule.desired}"` });
    }

    index = rowIndex - 1;
  }

  if (changes.length === 0) {
    return { content, changes };
  }

  const newline = content.includes('\r\n') ? '\r\n' : '\n';
  return { content: lines.join(newline), changes };
}

export function syncCounters(
  content: string,
  nextNumber: string,
  fileLabel: string,
): { content: string; changes: SyncChange[] } {
  const changes: SyncChange[] = [];
  let next = content;

  next = next.replace(/(\*\*Next task:\*\*\s*)(\d+)/u, (full, prefix: string, current: string) => {
    if (current === nextNumber) {
      return full;
    }

    changes.push({ file: fileLabel, line: 0, detail: `Next task: ${current} → ${nextNumber}` });
    return `${prefix}${nextNumber}`;
  });

  next = next.replace(/(currently:\s*\*\*)(\d+)(\*\*)/u, (full, prefix: string, current: string, suffix: string) => {
    if (current === nextNumber) {
      return full;
    }

    changes.push({ file: fileLabel, line: 0, detail: `currently: ${current} → ${nextNumber}` });
    return `${prefix}${nextNumber}${suffix}`;
  });

  return { content: next, changes };
}

function loadAllowlist(): Allowlist {
  try {
    return JSON.parse(readFileSync(allowlistPath, 'utf8')) as Allowlist;
  } catch {
    return {};
  }
}

function buildRules(headers: TaskHeader[], variants: Record<string, string[]> = {}): Map<string, StatusRule> {
  const rules = new Map<string, StatusRule>();

  for (const header of headers) {
    const accepted = new Set<string>([normalizeText(header.status)]);
    for (const variant of variants[header.id] ?? []) {
      accepted.add(normalizeText(variant));
    }
    rules.set(header.id, { desired: header.status, accepted });
  }

  return rules;
}

export function syncTaskIndex(write: boolean): SyncChange[] {
  const headers = loadTaskHeaders();
  const allowlist = loadAllowlist();
  const nextNumber = computeNextTaskNumber(headers);
  const parentIds = new Set(headers.filter((header) => header.id.includes('.')).map((header) => header.id.split('.')[0]));
  const readmeRules = buildRules(headers, allowlist.readmeStatusVariants);
  const parentRules = buildRules(headers, allowlist.parentTableStatusVariants);
  const changes: SyncChange[] = [];
  const writes = new Map<string, string>();

  const readmeOriginal = readFileSync(readmePath, 'utf8');
  const readmeStatus = syncStatusCells(readmeOriginal, readmeRules, 'tasks/README.md');
  const readmeBoth = syncCounters(readmeStatus.content, nextNumber, 'tasks/README.md');
  changes.push(...readmeStatus.changes, ...readmeBoth.changes);
  if (readmeBoth.content !== readmeOriginal) {
    writes.set(readmePath, readmeBoth.content);
  }

  for (const header of headers) {
    if (!parentIds.has(header.id) || header.id.includes('.')) {
      continue;
    }

    const filePath = path.join(tasksDir, header.filename);
    const original = readFileSync(filePath, 'utf8');
    const synced = syncStatusCells(original, parentRules, `tasks/${header.filename}`);
    changes.push(...synced.changes);
    if (synced.content !== original) {
      writes.set(filePath, synced.content);
    }
  }

  if (write) {
    for (const [filePath, content] of writes) {
      writeFileSync(filePath, content);
    }
  }

  return changes;
}

function isMain(): boolean {
  const entry = process.argv[1] ?? '';
  return entry.includes('sync-task-index');
}

if (isMain()) {
  const write = process.argv.includes('--write');
  const changes = syncTaskIndex(write);
  console.log(`Mode: ${write ? 'write' : 'dry-run'}`);
  console.log(`Index changes: ${changes.length}`);
  for (const change of changes) {
    console.log(`  ${change.file}${change.line ? `:${change.line}` : ''} — ${change.detail}`);
  }
  if (!write && changes.length > 0) {
    console.log('\nRe-run with --write to apply.');
  }
}