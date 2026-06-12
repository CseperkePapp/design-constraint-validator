import { describe, expect, test } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { globSync } from 'glob';

interface TaskMetadata {
  id: string;
  baseStatus: string;
  completed: string | null;
  content: string;
  dependencies: string | null;
  filePath: string;
  parentField: string | null;
  relativePath: string;
  status: string;
}

interface MarkdownRow {
  cells: string[];
  line: number;
  raw: string;
}

interface MarkdownTable {
  headers: string[];
  rows: MarkdownRow[];
}

interface ReadmeTaskRow {
  id: string;
  line: number;
  resolvedPath: string;
  status: string | null;
}

interface ParentTableRow {
  id: string;
  line: number;
  parentId: string;
  parentPath: string;
  status: string;
}

interface Allowlist {
  note?: string;
  parentTableStatusVariants?: Record<string, string[]>;
  readmeStatusVariants?: Record<string, string[]>;
}

const repoRoot = process.cwd();
const tasksDir = path.resolve(repoRoot, 'docs/project-management/tasks');
const readmePath = path.join(tasksDir, 'README.md');
const allowlistPath = path.resolve(repoRoot, 'src/__tests__/task-workflow-integrity.allowlist.json');
const validDatePattern = /^\d{4}-\d{2}-\d{2}$/;
const deprecatedStatuses = new Set(['cancelled', 'absorbed', 'closed', 'obsolete', 'superseded', 'deprecated']);

function normalizeText(value: string): string {
  return value.normalize('NFKC').replace(/\s+/gu, ' ').trim();
}

function normalizeTaskIdCell(value: string): string {
  return normalizeText(value).replace(/[*`]/gu, '');
}

function extractBaseTaskStatus(value: string): string {
  return normalizeText(value).split(/\s*\(/u)[0].trim().toLowerCase();
}

function extractField(content: string, fieldName: string): string | null {
  const match = content.match(new RegExp(`^\\*\\*${fieldName}:\\*\\*\\s*(.+)$`, 'im'));
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

function parseMarkdownTables(content: string): MarkdownTable[] {
  const lines = content.split(/\r?\n/u);
  const tables: MarkdownTable[] = [];

  for (let index = 0; index < lines.length - 1; index++) {
    if (!lines[index].trim().startsWith('|') || !isSeparatorRow(lines[index + 1])) {
      continue;
    }

    const headers = splitTableRow(lines[index]);
    const rows: MarkdownRow[] = [];
    index += 2;

    while (index < lines.length && lines[index].trim().startsWith('|')) {
      rows.push({ cells: splitTableRow(lines[index]), line: index + 1, raw: lines[index] });
      index++;
    }

    tables.push({ headers, rows });
    index--;
  }

  return tables;
}

function resolveDocLink(sourcePath: string, linkTarget: string): string | null {
  const cleanTarget = linkTarget.split('#')[0];
  if (!cleanTarget || /^[a-z]+:/iu.test(cleanTarget)) {
    return null;
  }

  return path.resolve(path.dirname(sourcePath), cleanTarget.replace(/\//gu, path.sep));
}

function extractTaskIdFromFilename(filePath: string): string {
  const match = path.basename(filePath).match(/^(?:DONE-|DEPR-)?TASK-(\d+(?:\.\d+)?)/u);
  if (!match) {
    throw new Error(`Unable to extract task id from ${filePath}`);
  }
  return match[1];
}

function loadAllowlist(): Allowlist {
  return JSON.parse(readFileSync(allowlistPath, 'utf8')) as Allowlist;
}

function loadTaskMetadata(): TaskMetadata[] {
  return [
    ...globSync('docs/project-management/tasks/TASK-*.md', { cwd: repoRoot, nodir: true }),
    ...globSync('docs/project-management/tasks/DONE-TASK-*.md', { cwd: repoRoot, nodir: true }),
    ...globSync('docs/project-management/tasks/DEPR-TASK-*.md', { cwd: repoRoot, nodir: true }),
  ]
    .sort((left, right) => left.localeCompare(right))
    .map((relativePath) => {
      const filePath = path.resolve(repoRoot, relativePath);
      const content = readFileSync(filePath, 'utf8');
      const status = extractField(content, 'Status');
      if (!status) {
        throw new Error(`Missing Status in ${relativePath}`);
      }

      return {
        id: extractTaskIdFromFilename(filePath),
        baseStatus: extractBaseTaskStatus(status),
        completed: extractField(content, 'Completed'),
        content,
        dependencies: extractField(content, 'Dependencies'),
        filePath,
        parentField: extractField(content, 'Parent'),
        relativePath,
        status,
      };
    });
}

function parseReadmeTaskRows(readmeContent: string): ReadmeTaskRow[] {
  const rows: ReadmeTaskRow[] = [];

  for (const table of parseMarkdownTables(readmeContent)) {
    const normalizedHeaders = table.headers.map((header) => normalizeText(header).toLowerCase());
    const statusIndex = normalizedHeaders.indexOf('status');

    for (const row of table.rows) {
      const id = normalizeTaskIdCell(row.cells[0] ?? '');
      if (!id || !/^\d+(?:\.\d+)?$/u.test(id)) {
        continue;
      }

      const linkMatch = row.raw.match(/\]\(([^)]*(?:DONE-|DEPR-)?TASK-[^)]+\.md)\)/u);
      if (!linkMatch) {
        continue;
      }

      rows.push({
        id,
        line: row.line,
        resolvedPath: path.resolve(tasksDir, linkMatch[1].replace(/\//gu, path.sep)),
        status: statusIndex >= 0 ? row.cells[statusIndex]?.trim() ?? null : null,
      });
    }
  }

  return rows;
}

function parseParentStatusRows(tasks: TaskMetadata[]): ParentTableRow[] {
  const rows: ParentTableRow[] = [];

  for (const task of tasks.filter((entry) => !entry.id.includes('.'))) {
    for (const table of parseMarkdownTables(task.content)) {
      const normalizedHeaders = table.headers.map((header) => normalizeText(header).toLowerCase());
      const statusIndex = normalizedHeaders.indexOf('status');
      if (statusIndex === -1) {
        continue;
      }

      for (const row of table.rows) {
        const rowId = normalizeTaskIdCell(row.cells[0] ?? '');
        if (!rowId || !new RegExp(`^${task.id}\\.\\d+$`, 'u').test(rowId)) {
          continue;
        }

        if (!/\]\(([^)]*(?:DONE-|DEPR-)?TASK-[^)]+\.md)\)/u.test(row.raw)) {
          continue;
        }

        rows.push({
          id: rowId,
          line: row.line,
          parentId: task.id,
          parentPath: task.relativePath,
          status: row.cells[statusIndex] ?? '',
        });
      }
    }
  }

  return rows;
}

function computeExpectedNextTask(tasks: TaskMetadata[]): string {
  const topLevelIds = tasks
    .filter((task) => !task.id.includes('.'))
    .map((task) => Number.parseInt(task.id, 10))
    .filter((value) => Number.isFinite(value));

  const next = topLevelIds.length > 0 ? Math.max(...topLevelIds) + 1 : 1;
  return String(next).padStart(3, '0');
}

function extractResolvedMarkdownLinks(filePath: string, content: string): string[] {
  const links: string[] = [];
  const pattern = /\[[^\]]+\]\(([^)]+\.md(?:#[^)]+)?)\)/gu;

  for (const match of content.matchAll(pattern)) {
    const resolved = resolveDocLink(filePath, match[1]);
    if (resolved) {
      links.push(resolved);
    }
  }

  return links;
}

describe('Task workflow integrity (portable template)', () => {
  const tasks = loadTaskMetadata();
  const taskById = new Map(tasks.map((task) => [task.id, task]));
  const readmeContent = readFileSync(readmePath, 'utf8');
  const readmeRows = parseReadmeTaskRows(readmeContent);
  const readmeRowById = new Map(readmeRows.map((row) => [row.id, row]));
  const parentRows = parseParentStatusRows(tasks);
  const allowlist = loadAllowlist();

  test('every task file appears in the tasks README', () => {
    const missing = tasks.filter((task) => !readmeRowById.has(task.id));
    expect(missing.map((task) => task.relativePath)).toEqual([]);
  });

  test('README rows resolve to real task files for the same task id and matching status', () => {
    const mismatches: string[] = [];

    for (const row of readmeRows) {
      const task = taskById.get(row.id);
      if (!task) {
        mismatches.push(`README row ${row.id} has no matching task file`);
        continue;
      }

      if (!existsSync(row.resolvedPath)) {
        mismatches.push(`README row ${row.id} points at missing file`);
        continue;
      }

      if (path.resolve(task.filePath) !== row.resolvedPath) {
        mismatches.push(`README row ${row.id} points at the wrong file`);
      }

      const accepted = new Set([normalizeText(task.status), ...((allowlist.readmeStatusVariants?.[task.id] ?? []).map(normalizeText))]);
      if (row.status && !accepted.has(normalizeText(row.status))) {
        mismatches.push(`README row ${row.id} status "${row.status}" does not match task header "${task.status}"`);
      }
    }

    expect(mismatches).toEqual([]);
  });

  test('subtasks point at real parents and parent status tables stay aligned', () => {
    const problems: string[] = [];

    for (const task of tasks.filter((entry) => entry.id.includes('.'))) {
      const expectedParentId = task.id.split('.')[0];
      if (!task.parentField) {
        problems.push(`${task.relativePath} is a subtask but lacks Parent:`);
        continue;
      }

      const parentLinkMatch = task.parentField.match(/\(([^)]+\.md)\)/u);
      if (!parentLinkMatch) {
        problems.push(`${task.relativePath} Parent field does not contain a markdown link`);
        continue;
      }

      const resolvedParent = resolveDocLink(task.filePath, parentLinkMatch[1]);
      if (!resolvedParent || !existsSync(resolvedParent)) {
        problems.push(`${task.relativePath} Parent link does not resolve`);
        continue;
      }

      const parentTask = taskById.get(expectedParentId);
      if (!parentTask || path.resolve(parentTask.filePath) !== resolvedParent) {
        problems.push(`${task.relativePath} Parent link does not match expected parent id ${expectedParentId}`);
      }
    }

    for (const row of parentRows) {
      const task = taskById.get(row.id);
      if (!task) {
        problems.push(`${row.parentPath}:${row.line} references missing subtask ${row.id}`);
        continue;
      }

      const accepted = new Set([normalizeText(task.status), ...((allowlist.parentTableStatusVariants?.[row.id] ?? []).map(normalizeText))]);
      if (!accepted.has(normalizeText(row.status))) {
        problems.push(`${row.parentPath}:${row.line} status for ${row.id} does not match task header`);
      }
    }

    expect(problems).toEqual([]);
  });

  test('done tasks have Completed dates', () => {
    const offenders = tasks
      .filter((task) => task.baseStatus === 'done')
      .filter((task) => !task.completed || !validDatePattern.test(task.completed))
      .map((task) => task.relativePath);

    expect(offenders).toEqual([]);
  });

  test('done and deprecated tasks use lifecycle filename prefixes', () => {
    const offenders: string[] = [];

    for (const task of tasks) {
      const basename = path.basename(task.relativePath);
      if (task.baseStatus === 'done' && !basename.startsWith('DONE-TASK-')) {
        offenders.push(`${task.relativePath} is done but lacks DONE-TASK- prefix`);
      }
      if (deprecatedStatuses.has(task.baseStatus) && !basename.startsWith('DEPR-TASK-')) {
        offenders.push(`${task.relativePath} is ${task.baseStatus} but lacks DEPR-TASK- prefix`);
      }
    }

    expect(offenders).toEqual([]);
  });

  test('README counters match the next top-level task id', () => {
    const expected = computeExpectedNextTask(tasks);
    const nextTaskMatch = readmeContent.match(/\*\*Next task:\*\*\s*(\d+)/u);
    const currentMatch = readmeContent.match(/currently:\s*\*\*(\d+)\*\*/u);

    expect(nextTaskMatch?.[1]).toBe(expected);
    expect(currentMatch?.[1]).toBe(expected);
  });

  test('markdown links inside task files resolve', () => {
    const broken: string[] = [];

    for (const task of tasks) {
      for (const target of extractResolvedMarkdownLinks(task.filePath, task.content)) {
        if (!existsSync(target)) {
          broken.push(`${task.relativePath} links to missing markdown file ${path.relative(repoRoot, target)}`);
        }
      }
    }

    expect(broken).toEqual([]);
  });

  test('dependency task ids resolve to real task files', () => {
    const broken: string[] = [];

    for (const task of tasks) {
      const dependencies = task.dependencies ?? '';
      for (const match of dependencies.matchAll(/(?:DONE-|DEPR-)?TASK-(\d+(?:\.\d+)?)/gu)) {
        if (!taskById.has(match[1])) {
          broken.push(`${task.relativePath} depends on missing task ${match[1]}`);
        }
      }
    }

    expect(broken).toEqual([]);
  });
});