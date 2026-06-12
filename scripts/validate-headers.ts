#!/usr/bin/env tsx
import * as fs from 'node:fs';
import * as path from 'node:path';
import { glob } from 'glob';

const taskStatusValues = ['planning', 'future', 'todo', 'in-progress', 'on-hold', 'done', 'blocked', 'cancelled'];
const pass = 'PASS';
const fail = 'FAIL';
const warn = 'WARN';

const statusValues = {
  task: taskStatusValues,
  prompt: ['active', 'used', 'superseded'],
  brief: ['active', 'used', 'superseded'],
  canon: [],
  intent: ['active', 'draft', 'superseded'],
  decision: ['implemented', 'in-progress', 'reverted'],
  report: ['draft', 'review', 'final', 'superseded'],
  workflow: ['draft', 'active', 'retired', 'superseded'],
};

const priorityValues = ['--', 'p0', 'p1', 'p2', 'p3', 'p4', 'low', 'medium', 'high', 'critical'];
const authorityValues = ['canonical', 'derived', 'provisional'];
const agentValues = ['human', 'claude', 'chatgpt', 'gemini', 'codex', 'copilot', 'ai', 'mixed'];
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const semverRegex = /^\d+\.\d+\.\d+$/;

interface ValidationError {
  file: string;
  line?: number;
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

interface ValidationResult {
  file: string;
  docType: string | null;
  errors: ValidationError[];
  warnings: ValidationError[];
}

function detectDocType(filename: string, content: string): string | null {
  const basename = path.basename(filename);
  const dirPath = path.dirname(filename);

  if (dirPath.includes('000-WORKFLOW-SYSTEM')) {
    return null;
  }

  if (dirPath.includes('tasks') && /^(?:DONE-|DEPR-)?TASK-/u.test(basename)) return 'task';
  if (dirPath.includes('reports') && /^REPORT-/u.test(basename)) return 'report';
  if (dirPath.includes('workflows') && content.includes('**Type:** Workflow')) return 'workflow';
  if (basename.match(/^p\d{3}-/u)) return 'prompt';
  if (basename.startsWith('DEC-')) return 'decision';
  if (basename.startsWith('BRIEF-')) return 'brief';
  if (content.includes('**Type:** Canon')) return 'canon';
  if (content.includes('**Type:** Intent')) return 'intent';
  if (content.includes('**Type:** Report')) return 'report';
  if (content.includes('**Type:** Workflow')) return 'workflow';
  if (basename === 'README.md' && content.includes('**Type:**')) return 'canon';

  return null;
}

function extractField(content: string, fieldName: string): { value: string | null; line: number } {
  const lines = content.split('\n');
  const patterns = [
    new RegExp(`^\\*\\*${fieldName}:\\*\\*\\s*(.+)`, 'i'),
    new RegExp(`^${fieldName}:\\s*(.+)`, 'i'),
    new RegExp(`^-\\s*${fieldName}:\\s*(.+)`, 'i'),
  ];

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index].trim();
    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        return { value: match[1].trim(), line: index + 1 };
      }
    }
  }

  return { value: null, line: 0 };
}

function extractSourceField(content: string, fieldName: string): { value: string | null; line: number } {
  const lines = content.split('\n');
  const pattern = new RegExp(`^-\\s*${fieldName}:\\s*(.+)`, 'i');
  let inSourceSection = false;

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index].trim();
    if (line.match(/^##\s*Source/i)) {
      inSourceSection = true;
      continue;
    }
    if (inSourceSection && line.startsWith('##')) {
      break;
    }
    if (inSourceSection) {
      const match = line.match(pattern);
      if (match) {
        return { value: match[1].trim(), line: index + 1 };
      }
    }
  }

  return { value: null, line: 0 };
}

function extractBaseTaskStatus(value: string): string {
  return value.split(/\s*\(/u)[0].trim().toLowerCase();
}

function isKnownAgentValue(value: string): boolean {
  const base = value.split(/\s*\(/u)[0].trim().toLowerCase();
  if (agentValues.includes(base)) {
    return true;
  }

  const parts = base.split(/\s*\+\s*/u).map((part) => part.trim()).filter(Boolean);
  return parts.length > 1 && parts.every((part) => agentValues.includes(part));
}

function validateTask(file: string, content: string): ValidationError[] {
  const errors: ValidationError[] = [];
  const status = extractField(content, 'Status');
  if (!status.value) {
    errors.push({ file, field: 'Status', message: 'Missing required field', severity: 'error' });
  } else if (!statusValues.task.includes(extractBaseTaskStatus(status.value))) {
    errors.push({ file, line: status.line, field: 'Status', message: `Invalid value "${status.value}"`, severity: 'error' });
  }

  const priority = extractField(content, 'Priority');
  if (!priority.value) {
    errors.push({ file, field: 'Priority', message: 'Missing required field', severity: 'error' });
  } else if (!priorityValues.includes(priority.value.toLowerCase())) {
    errors.push({ file, line: priority.line, field: 'Priority', message: `Invalid value "${priority.value}"`, severity: 'error' });
  }

  const created = extractField(content, 'Created');
  if (!created.value || !dateRegex.test(created.value)) {
    errors.push({ file, line: created.line, field: 'Created', message: 'Missing or invalid YYYY-MM-DD date', severity: 'error' });
  }

  if (status.value && extractBaseTaskStatus(status.value) === 'done') {
    const completed = extractField(content, 'Completed');
    if (!completed.value || !dateRegex.test(completed.value)) {
      errors.push({ file, line: completed.line, field: 'Completed', message: 'Required for done tasks', severity: 'error' });
    }
  }

  const basename = path.basename(file);
  if (basename.match(/^(?:DONE-|DEPR-)?TASK-\d+\.\d+/u)) {
    const parent = extractField(content, 'Parent');
    if (!parent.value) {
      errors.push({ file, field: 'Parent', message: 'Required for subtasks', severity: 'error' });
    }
  }

  const agent = extractSourceField(content, 'agent');
  if (!agent.value) {
    errors.push({ file, field: 'Source.agent', message: 'Missing required field', severity: 'warning' });
  } else if (!isKnownAgentValue(agent.value)) {
    errors.push({ file, line: agent.line, field: 'Source.agent', message: `Invalid value "${agent.value}"`, severity: 'warning' });
  }

  const model = extractSourceField(content, 'model');
  if (!model.value) {
    errors.push({ file, field: 'Source.model', message: 'Missing required field', severity: 'warning' });
  }

  return errors;
}

function validatePrompt(file: string, content: string): ValidationError[] {
  const errors: ValidationError[] = [];
  const task = extractField(content, 'Task');
  if (!task.value) errors.push({ file, field: 'Task', message: 'Missing required field', severity: 'error' });
  const status = extractField(content, 'Status');
  if (!status.value || !statusValues.prompt.includes(status.value.toLowerCase())) {
    errors.push({ file, line: status.line, field: 'Status', message: 'Missing or invalid status', severity: 'error' });
  }
  const agent = extractSourceField(content, 'agent');
  if (!agent.value) errors.push({ file, field: 'Source.agent', message: 'Missing required field', severity: 'warning' });
  const model = extractSourceField(content, 'model');
  if (!model.value) errors.push({ file, field: 'Source.model', message: 'Missing required field', severity: 'warning' });
  return errors;
}

function validateCanon(file: string, content: string): ValidationError[] {
  const errors: ValidationError[] = [];
  const type = extractField(content, 'Type');
  if (!type.value || type.value !== 'Canon') errors.push({ file, line: type.line, field: 'Type', message: 'Expected Canon', severity: 'error' });
  const version = extractField(content, 'Version');
  if (!version.value || !semverRegex.test(version.value)) errors.push({ file, line: version.line, field: 'Version', message: 'Missing or invalid X.Y.Z version', severity: 'error' });
  const authority = extractField(content, 'Authority');
  if (!authority.value || !authorityValues.includes(authority.value.toLowerCase())) errors.push({ file, line: authority.line, field: 'Authority', message: 'Missing or invalid authority', severity: 'error' });
  const verified = extractField(content, 'Verified');
  if (!verified.value || !dateRegex.test(verified.value)) errors.push({ file, line: verified.line, field: 'Verified', message: 'Missing or invalid YYYY-MM-DD date', severity: 'error' });
  return errors;
}

function validateIntent(file: string, content: string): ValidationError[] {
  const errors: ValidationError[] = [];
  const type = extractField(content, 'Type');
  if (!type.value || type.value !== 'Intent') errors.push({ file, line: type.line, field: 'Type', message: 'Expected Intent', severity: 'error' });
  const goal = extractField(content, 'Goal');
  if (!goal.value) errors.push({ file, field: 'Goal', message: 'Missing required field', severity: 'error' });
  const constraints = extractField(content, 'Constraints');
  if (!constraints.value) errors.push({ file, field: 'Constraints', message: 'Missing required field', severity: 'error' });
  const status = extractField(content, 'Status');
  if (!status.value || !statusValues.intent.includes(status.value.toLowerCase())) errors.push({ file, line: status.line, field: 'Status', message: 'Missing or invalid status', severity: 'error' });
  const updated = extractField(content, 'Updated');
  if (!updated.value || !dateRegex.test(updated.value)) errors.push({ file, line: updated.line, field: 'Updated', message: 'Missing or invalid YYYY-MM-DD date', severity: 'error' });
  return errors;
}

function validateBrief(file: string, content: string): ValidationError[] {
  const errors: ValidationError[] = [];
  const task = extractField(content, 'Task');
  if (!task.value) errors.push({ file, field: 'Task', message: 'Missing required field', severity: 'error' });
  const status = extractField(content, 'Status');
  if (!status.value || !statusValues.brief.includes(status.value.toLowerCase())) errors.push({ file, line: status.line, field: 'Status', message: 'Missing or invalid status', severity: 'error' });
  const updated = extractField(content, 'Updated');
  if (!updated.value || !dateRegex.test(updated.value)) errors.push({ file, line: updated.line, field: 'Updated', message: 'Missing or invalid YYYY-MM-DD date', severity: 'error' });
  return errors;
}

function validateReport(file: string, content: string): ValidationError[] {
  const errors: ValidationError[] = [];
  const type = extractField(content, 'Type');
  if (!type.value || type.value !== 'Report') errors.push({ file, line: type.line, field: 'Type', message: 'Expected Report', severity: 'error' });
  const status = extractField(content, 'Status');
  if (!status.value || !statusValues.report.includes(status.value.toLowerCase())) errors.push({ file, line: status.line, field: 'Status', message: 'Missing or invalid status', severity: 'error' });
  const created = extractField(content, 'Created');
  if (!created.value || !dateRegex.test(created.value)) errors.push({ file, line: created.line, field: 'Created', message: 'Missing or invalid YYYY-MM-DD date', severity: 'error' });
  const author = extractField(content, 'Author');
  if (!author.value) errors.push({ file, field: 'Author', message: 'Missing required field', severity: 'error' });
  const model = extractField(content, 'Model');
  if (!model.value) errors.push({ file, field: 'Model', message: 'Missing required field', severity: 'error' });
  return errors;
}

function validateWorkflow(file: string, content: string): ValidationError[] {
  const errors: ValidationError[] = [];
  const type = extractField(content, 'Type');
  if (!type.value || type.value !== 'Workflow') errors.push({ file, line: type.line, field: 'Type', message: 'Expected Workflow', severity: 'error' });
  const status = extractField(content, 'Status');
  if (!status.value || !statusValues.workflow.includes(status.value.toLowerCase())) errors.push({ file, line: status.line, field: 'Status', message: 'Missing or invalid status', severity: 'error' });
  const version = extractField(content, 'Version');
  if (!version.value || !semverRegex.test(version.value)) errors.push({ file, line: version.line, field: 'Version', message: 'Missing or invalid X.Y.Z version', severity: 'error' });
  const owner = extractField(content, 'Owner');
  if (!owner.value) errors.push({ file, field: 'Owner', message: 'Missing required field', severity: 'error' });
  const created = extractField(content, 'Created');
  if (!created.value || !dateRegex.test(created.value)) errors.push({ file, line: created.line, field: 'Created', message: 'Missing or invalid YYYY-MM-DD date', severity: 'error' });
  const updated = extractField(content, 'Updated');
  if (!updated.value || !dateRegex.test(updated.value)) errors.push({ file, line: updated.line, field: 'Updated', message: 'Missing or invalid YYYY-MM-DD date', severity: 'error' });
  return errors;
}

function validateFile(filePath: string): ValidationResult {
  const content = fs.readFileSync(filePath, 'utf8');
  const docType = detectDocType(filePath, content);
  const result: ValidationResult = { file: filePath, docType, errors: [], warnings: [] };
  if (!docType) {
    return result;
  }

  let allErrors: ValidationError[] = [];
  switch (docType) {
    case 'task':
      allErrors = validateTask(filePath, content);
      break;
    case 'prompt':
      allErrors = validatePrompt(filePath, content);
      break;
    case 'canon':
      allErrors = validateCanon(filePath, content);
      break;
    case 'intent':
      allErrors = validateIntent(filePath, content);
      break;
    case 'brief':
      allErrors = validateBrief(filePath, content);
      break;
    case 'report':
      allErrors = validateReport(filePath, content);
      break;
    case 'workflow':
      allErrors = validateWorkflow(filePath, content);
      break;
    default:
      allErrors = [];
  }

  result.errors = allErrors.filter((error) => error.severity === 'error');
  result.warnings = allErrors.filter((error) => error.severity === 'warning');
  return result;
}

async function main() {
  const args = process.argv.slice(2);
  const targetPath = args[0] || 'docs/project-management';

  console.log('======================================================================');
  console.log('HEADER VALIDATION');
  console.log('======================================================================');
  console.log();

  let files: string[] = [];
  if (fs.existsSync(targetPath)) {
    const stat = fs.statSync(targetPath);
    if (stat.isDirectory()) {
      files = await glob(`${targetPath}/**/*.md`, { ignore: ['**/archive/**', '**/node_modules/**'] });
    } else {
      files = [targetPath];
    }
  } else {
    console.error(`${fail} Path does not exist: ${targetPath}`);
    process.exit(1);
  }

  if (files.length === 0) {
    console.log(`${warn} No markdown files found`);
    process.exit(0);
  }

  const results = files.map(validateFile);
  const errors = results.flatMap((result) => result.errors);
  const warnings = results.flatMap((result) => result.warnings);
  const validatedCount = results.filter((result) => result.docType).length;

  for (const error of errors) {
    console.log(`${fail} ${error.file}${error.line ? `:${error.line}` : ''} — ${error.field}: ${error.message}`);
  }
  for (const warningItem of warnings) {
    console.log(`${warn} ${warningItem.file}${warningItem.line ? `:${warningItem.line}` : ''} — ${warningItem.field}: ${warningItem.message}`);
  }

  console.log();
  console.log(`${pass} Files scanned: ${files.length}`);
  console.log(`${pass} Recognized docs: ${validatedCount}`);
  console.log(`${warn} Warnings: ${warnings.length}`);
  console.log(`${fail} Errors: ${errors.length}`);

  process.exit(errors.length > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});