import { flattenTokens } from '../../core/flatten.js';
import { Engine } from '../../core/engine.js';
import { loadConfig } from '../config.js';
import { parseBreakpoints, loadTokensWithBreakpoint, mergeTokens } from '../../core/breakpoints.js';
import { createValidationResult, createValidationReceipt, writeJsonOutput } from '../json-output.js';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { setupConstraints } from '../constraint-registry.js';
export async function validateCommand(_options) {
    try {
        const bps = parseBreakpoints(process.argv);
        const crossAxisDebug = process.argv.includes('--cross-axis-debug');
        const plan = bps.length ? bps : [undefined];
        let anyErrors = false;
        let totalErrors = 0;
        let totalWarnings = 0;
        const argv = process.argv.slice(2);
        const failOnIdx = argv.indexOf('--fail-on');
        const failOn = _options.failOn ?? (failOnIdx >= 0 ? argv[failOnIdx + 1] : 'error');
        const sumIdx = argv.indexOf('--summary');
        const summaryFmt = _options.summary ?? (sumIdx >= 0 ? argv[sumIdx + 1] : 'none');
        const outputFormat = _options.format ?? 'text';
        // Collect all issues for JSON output
        const allErrors = [];
        const allWarnings = [];
        const rows = [];
        function pushRow(bpLabel, stats) { rows.push({ bp: bpLabel, ...stats }); }
        function printSummaryTable(rs) {
            if (!rs.length)
                return;
            const showTotalLine = !rs.some(r => r.bp === 'TOTAL');
            const cols = ['scope', 'rules', 'warnings', 'errors'];
            const data = rs.map(r => ({ scope: r.bp, rules: String(r.rules), warnings: String(r.warnings), errors: String(r.errors) }));
            const widths = cols.map(c => Math.max(c.length, ...data.map(d => d[c].length)));
            const line = (vals) => vals.map((v, i) => v.padEnd(widths[i])).join('  ');
            console.log(line(cols));
            console.log(line(widths.map(w => '-'.repeat(w))));
            for (const d of data)
                console.log(line(cols.map(c => d[c])));
            if (showTotalLine && rs.length > 1) {
                const tot = rs.reduce((a, b) => ({ rules: a.rules + b.rules, warnings: a.warnings + b.warnings, errors: a.errors + b.errors }), { rules: 0, warnings: 0, errors: 0 });
                console.log(line(['TOTAL', String(tot.rules), String(tot.warnings), String(tot.errors)]));
            }
        }
        const cfgRes = loadConfig(_options.config);
        if (!cfgRes.ok) {
            console.error(cfgRes.error);
            process.exit(2);
        }
        const config = cfgRes.value;
        const perBpTimings = [];
        const tStartTotal = globalThis.performance.now();
        for (const bp of plan) {
            const tStart = globalThis.performance.now();
            let tokens = loadTokensWithBreakpoint(bp);
            // Optional theme overlay (tokens/themes/<name>.json), mirroring build behavior
            if (_options.theme) {
                const themePath = join('tokens/themes', `${_options.theme}.json`);
                if (existsSync(themePath)) {
                    try {
                        const themeTokens = JSON.parse(readFileSync(themePath, 'utf8'));
                        tokens = mergeTokens(tokens, themeTokens);
                    }
                    catch {
                        // If theme file is invalid JSON, ignore and proceed with base tokens
                    }
                }
            }
            // Create engine with flattened tokens
            const { flat, edges } = flattenTokens(tokens);
            const init = {};
            for (const t of Object.values(flat)) {
                init[t.id] = t.value;
            }
            const engine = new Engine(init, edges);
            const knownIds = new Set(Object.keys(init));
            // Discover and attach all constraints via centralized registry
            setupConstraints(engine, { config, bp, constraintsDir: 'themes' }, { knownIds, crossAxisDebug });
            const allIds = new Set(Object.keys(init));
            const issues = engine.evaluate(allIds);
            const errs = issues.filter((i) => i.level === 'error');
            const warns = issues.filter((i) => i.level !== 'error');
            if (errs.length)
                anyErrors = true;
            totalErrors += errs.length;
            totalWarnings += warns.length;
            // Collect for JSON output
            allErrors.push(...errs);
            allWarnings.push(...warns);
            const rulesEvaluated = errs.length + warns.length;
            pushRow(bp ?? 'global', { rules: rulesEvaluated, warnings: warns.length, errors: errs.length });
            const dur = globalThis.performance.now() - tStart;
            perBpTimings.push({ bp: bp ?? 'global', ms: dur });
            // Only print text output if not in JSON mode
            if (outputFormat !== 'json') {
                console.log(`validate${bp ? ` [bp=${bp}]` : ''}: ${errs.length} error(s), ${warns.length} warning(s)${_options.perf ? ` (${dur.toFixed(2)}ms)` : ''}`);
                for (const it of issues) {
                    const tag = it.level === 'error' ? 'ERROR' : 'WARN ';
                    console.log(`${tag} ${it.rule}  ${it.id}${it.where ? ' @ ' + it.where : ''}${bp ? ` [${bp}]` : ''} — ${it.message}`);
                }
            }
        }
        const totalMs = globalThis.performance.now() - tStartTotal;
        // Append aggregate total row if multiple scopes and not already added
        if (rows.length > 1) {
            const agg = rows.reduce((a, b) => ({ rules: a.rules + b.rules, warnings: a.warnings + b.warnings, errors: a.errors + b.errors }), { rules: 0, warnings: 0, errors: 0 });
            rows.push({ bp: 'TOTAL', ...agg });
        }
        // Get package version for stats
        let engineVersion = '1.0.0';
        try {
            // eslint-disable-next-line no-undef
            const pkgPath = new URL('../../package.json', import.meta.url);
            const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
            engineVersion = pkg.version;
        }
        catch {
            // Ignore package.json read errors, use default version
        }
        // Handle JSON output mode
        if (outputFormat === 'json') {
            const result = createValidationResult(allErrors, allWarnings, totalMs, engineVersion);
            // If receipt requested, generate full receipt
            if (_options.receipt) {
                const tokensFile = _options.tokens ?? 'tokens/tokens.example.json';
                const constraintsDir = 'themes';
                const receipt = createValidationReceipt(result, tokensFile, constraintsDir, bps[0], failOn);
                writeJsonOutput(receipt, _options.receipt);
            }
            else {
                writeJsonOutput(result, _options.output);
            }
        }
        else {
            // Text output mode
            if (_options.perf) {
                console.log('[perf] per-breakpoint timings:');
                for (const t of perBpTimings)
                    console.log(`  ${t.bp}: ${t.ms.toFixed(2)}ms`);
                console.log(`[perf] total: ${totalMs.toFixed(2)}ms`);
            }
            if (summaryFmt === 'json') {
                // Provide machine-readable aggregate separate from rows if TOTAL present
                const totalRow = rows.find(r => r.bp === 'TOTAL');
                const json = totalRow ? { rows, total: { rules: totalRow.rules, warnings: totalRow.warnings, errors: totalRow.errors } } : { rows };
                console.log(JSON.stringify(json, null, 2));
            }
            else if (summaryFmt === 'table') {
                printSummaryTable(rows);
            }
        }
        let code = anyErrors ? 1 : 0;
        // Budget checks (do not override fail-on semantics unless budgets add failures)
        const budgetTotal = _options['budget-total-ms'] ?? _options.budgetTotalMs;
        const budgetPerBp = _options['budget-per-bp-ms'] ?? _options.budgetPerBpMs;
        let budgetFailed = false;
        if (budgetTotal != null && totalMs > budgetTotal) {
            console.error(`[perf] total time ${totalMs.toFixed(2)}ms exceeded budget ${budgetTotal}ms`);
            budgetFailed = true;
        }
        if (budgetPerBp != null) {
            for (const t of perBpTimings) {
                if (t.ms > budgetPerBp) {
                    console.error(`[perf] ${t.bp} time ${t.ms.toFixed(2)}ms exceeded per-breakpoint budget ${budgetPerBp}ms`);
                    budgetFailed = true;
                }
            }
        }
        if (failOn === 'off')
            code = 0;
        else if (failOn === 'warn')
            code = (totalErrors + totalWarnings) > 0 ? 1 : 0;
        else
            code = totalErrors > 0 ? 1 : 0;
        if (budgetFailed)
            code = Math.max(code, 1);
        process.exit(code);
    }
    catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error('validate: failed:', msg);
        process.exit(2);
    }
}
