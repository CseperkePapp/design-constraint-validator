#!/usr/bin/env npx tsx
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, renameSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import { syncTaskIndex } from './sync-task-index.js';

interface TaskFile {
  baseStatus: string;
  completed: string | null;
  currentName: string;
  desiredName: string;
  id: string;
}

interface ReferenceUpdate {
  content: string;
  relativePath: string;
  replacements: number;
}

const repoRoot = process.cwd();
const tasksDir = path.resolve(repoRoot, 'docs/project-management/tasks');
const taskFilenamePattern = /^(DONE-|DEPR-)?TASK-(\d+(?:\.\d+)?)(?:-.+)?\.md$/u;
const validDatePattern = /^\d{4}-\d{2}-\d{2}$/u;
const deprecatedStatuses = new Set(['cancelled', 'absorbed', 'closed', 'obsolete', 'superseded', 'deprecated']);

function prefixForStatus(baseStatus: string): string {
  if (baseStatus === 'done') {
    return 'DONE-';
  }
  if (deprecatedStatuses.has(baseStatus)) {
    return 'DEPR-';
  }
  return '';
}

function computeDesiredName(currentName: string, targetPrefix: string): string {
  const match = currentName.match(/^(?:DONE-|DEPR-)?TASK-(\d+(?:\.\d+)?)(-.+)?\.md$/u);
  if (!match) {
    throw new Error(`Cannot parse task filename: ${currentName}`);
  }

  const number = match[1];
  const rest = match[2] ?? '';
  return `${targetPrefix}TASK-${number}${rest}.md`;
}

function extractField(content: string, fieldName: string): string | null {
  const match = content.match(new RegExp(`^\\*\\*${fieldName}:\\*\\*\\s*(.+)$`, 'imu'));
  return match?.[1]?.trim() ?? null;
}

function extractBaseStatus(status: string): string {
  return status.split(/\s*\(/u)[0].trim().toLowerCase();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
}

function loadTaskFiles(): TaskFile[] {
  const tasks: TaskFile[] = [];
  const taskIds = new Map<string, string>();

  for (const currentName of readdirSync(tasksDir)) {
    const filenameMatch = currentName.match(taskFilenamePattern);
    if (!filenameMatch) {
      continue;
    }

    const currentPath = path.join(tasksDir, currentName);
    if (!statSync(currentPath).isFile()) {
      continue;
    }

    const content = readFileSync(currentPath, 'utf8');
    const status = extractField(content, 'Status');
    if (!status) {
      throw new Error(`Missing Status header: ${currentName}`);
    }

    const id = filenameMatch[2];
    const existingName = taskIds.get(id);
    if (existingName) {
      throw new Error(`Duplicate task id ${id}: ${existingName} and ${currentName}`);
    }
    taskIds.set(id, currentName);

    const baseStatus = extractBaseStatus(status);
    if (currentName.startsWith('DONE-TASK-') && baseStatus !== 'done') {
      throw new Error(`${currentName} uses DONE-TASK prefix but has Status: ${status}`);
    }
    if (currentName.startsWith('DEPR-TASK-') && !deprecatedStatuses.has(baseStatus)) {
      throw new Error(`${currentName} uses DEPR-TASK prefix but has Status: ${status}`);
    }

    const completed = extractField(content, 'Completed');
    if (baseStatus === 'done' && (!completed || !validDatePattern.test(completed))) {
      throw new Error(`${currentName} is done but lacks a valid Completed: YYYY-MM-DD header`);
    }

    tasks.push({
      baseStatus,
      completed,
      currentName,
      desiredName: computeDesiredName(currentName, prefixForStatus(baseStatus)),
      id,
    });
  }

  return tasks.sort((left, right) => left.id.localeCompare(right.id, undefined, { numeric: true }));
}

function listRepositoryFiles(): string[] {
  const output = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], {
    cwd: repoRoot,
    encoding: 'utf8',
  });

  return output
    .split('\0')
    .filter(Boolean)
    .filter((relativePath) => existsSync(path.resolve(repoRoot, relativePath)));
}

function findReferenceUpdates(tasks: TaskFile[]): ReferenceUpdate[] {
  const stem = (name: string): string => name.replace(/\.md$/u, '');
  const replacements = tasks
    .filter((task) => task.desiredName !== task.currentName)
    .map((task) => [stem(task.currentName), stem(task.desiredName)] as const);
  const updates: ReferenceUpdate[] = [];

  for (const relativePath of listRepositoryFiles()) {
    const filePath = path.resolve(repoRoot, relativePath);
    if (!statSync(filePath).isFile()) {
      continue;
    }

    const buffer = readFileSync(filePath);
    if (buffer.includes(0)) {
      continue;
    }

    const originalContent = buffer.toString('utf8');
    let content = originalContent;
    let replacementCount = 0;

    for (const [from, to] of replacements) {
      const legacyReferencePattern = new RegExp(`(?<!DONE-)(?<!DEPR-)${escapeRegExp(from)}`, 'gu');
      content = content.replace(legacyReferencePattern, () => {
        replacementCount++;
        return to;
      });
    }

    if (content !== originalContent) {
      updates.push({ content, relativePath, replacements: replacementCount });
    }
  }

  return updates;
}

function main(): void {
  const applyChanges = process.argv.includes('--write');
  const verbose = process.argv.includes('--verbose');
  const tasks = loadTaskFiles();
  const renameOperations = tasks
    .filter((task) => task.currentName !== task.desiredName)
    .map((task) => ({ from: task.currentName, to: task.desiredName }));

  if (applyChanges) {
    for (const operation of renameOperations) {
      renameSync(path.resolve(tasksDir, operation.from), path.resolve(tasksDir, operation.to));
    }
  }

  const referenceUpdates = findReferenceUpdates(tasks);
  const replacementCount = referenceUpdates.reduce((total, update) => total + update.replacements, 0);

  if (applyChanges) {
    for (const update of referenceUpdates) {
      writeFileSync(path.resolve(repoRoot, update.relativePath), update.content);
    }
  }

  const indexChanges = syncTaskIndex(applyChanges);

  console.log(`Mode: ${applyChanges ? 'write' : 'dry-run'}`);
  console.log(`Task files scanned: ${tasks.length}`);
  console.log(`Task files to rename: ${renameOperations.length}`);
  console.log(`Reference files to update: ${referenceUpdates.length}`);
  console.log(`Filename references to rewrite: ${replacementCount}`);
  console.log(`Index status/counter fixes: ${indexChanges.length}`);

  if (verbose && indexChanges.length > 0) {
    console.log('\nIndex sync:');
    for (const change of indexChanges) {
      console.log(`  ${change.file}${change.line ? `:${change.line}` : ''} — ${change.detail}`);
    }
  }

  if (verbose && renameOperations.length > 0) {
    console.log('\nRenames:');
    for (const operation of renameOperations) {
      console.log(`  ${operation.from} -> ${operation.to}`);
    }
  }

  if (verbose && referenceUpdates.length > 0) {
    console.log('\nReference updates:');
    for (const update of referenceUpdates) {
      console.log(`  ${update.relativePath} (${update.replacements})`);
    }
  }

  if (!applyChanges) {
    console.log('\nNo files changed. Re-run with --write to apply the migration.');
  }
}

main();