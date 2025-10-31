import { join } from 'node:path';
import { readFileSync, existsSync } from 'node:fs';
import { loadConfig } from '../config.js';
import { createEngine } from '../engine-helpers.js';
import { flattenTokens } from '../../core/flatten.js';
import { loadTokens, outputResult } from './utils.js';
// Lightweight suggestion helpers (kept local – why command uses core formatter instead)
function levenshtein(a, b) {
    const al = a.length, bl = b.length;
    const dp = Array(bl + 1).fill(0).map((_, i) => i);
    for (let i = 1; i <= al; i++) {
        let prev = dp[0];
        dp[0] = i;
        for (let j = 1; j <= bl; j++) {
            const tmp = dp[j];
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + cost);
            prev = tmp;
        }
    }
    return dp[bl];
}
function suggestIds(id, candidates, k = 3) {
    return candidates.map(c => ({ id: c, d: levenshtein(id, c) }))
        .sort((a, b) => a.d - b.d).slice(0, k);
}
function parseSetExpression(expr) {
    const match = expr.match(/^([^=]+)=(.+)$/);
    if (!match)
        throw new Error(`Invalid set expression: ${expr}. Use format: token.id=value`);
    const [, id, rawValue] = match;
    const numValue = Number(rawValue);
    const value = !isNaN(numValue) && isFinite(numValue) ? numValue : rawValue;
    return { id: id.trim(), value };
}
function isPlainObject(x) { return x && typeof x === 'object' && !Array.isArray(x); }
function collectDeep(obj, prefix = [], out = []) {
    if (!isPlainObject(obj)) {
        if (prefix.length)
            out.push({ id: prefix.join('.'), value: obj, unset: obj === null });
        return out;
    }
    const hasValue = Object.prototype.hasOwnProperty.call(obj, '$value');
    const hasUnset = Object.prototype.hasOwnProperty.call(obj, '$unset');
    if (hasValue || hasUnset) {
        const rec = obj;
        const v = rec.$value;
        const u = rec.$unset === true || v === null;
        if (prefix.length)
            out.push({ id: prefix.join('.'), value: v, unset: u });
        return out;
    }
    for (const k of Object.keys(obj)) {
        collectDeep(obj[k], [...prefix, k], out);
    }
    return out;
}
function normalizeBatch(raw) {
    if (Array.isArray(raw))
        return raw.map(e => ({ id: e.id, value: Object.prototype.hasOwnProperty.call(e, 'value') ? e.value : (Object.prototype.hasOwnProperty.call(e, '$value') ? e.$value : undefined), unset: e.unset === true || e.$unset === true || e.value === null || e.$value === null }));
    if (isPlainObject(raw)) {
        const hasNested = Object.values(raw).some(v => isPlainObject(v));
        if (hasNested) {
            const entries = collectDeep(raw).filter(e => e.id && (e.unset || typeof e.value !== 'undefined'));
            if (entries.length)
                return entries;
        }
        const r = raw;
        return Object.keys(r).map(k => ({ id: k, value: r[k], unset: r[k] === null }));
    }
    return [];
}
function parseValue(v) { const num = Number(v); return !isNaN(num) && isFinite(num) ? num : v; }
export async function setCommand(options) {
    const debugSet = process.env.LARISSA_DEBUG_SET === '1' || process.argv.includes('--debug-set');
    const tokensPath = options.tokens || 'tokens/tokens.json';
    const cfgRes = loadConfig(options.config);
    if (!cfgRes.ok) {
        console.error(cfgRes.error);
        process.exit(2);
    }
    const config = cfgRes.value;
    const tokens = loadTokens(tokensPath);
    const engine = createEngine(tokens, config);
    const { flat: flatAll } = flattenTokens(tokens);
    const knownIds = new Set(Object.keys(flatAll));
    function ensureKnownOrSuggest(id) {
        if (!knownIds.has(id)) {
            const suggestions = suggestIds(id, Array.from(knownIds));
            console.error(`Unknown id: ${id}`);
            if (suggestions.length) {
                console.error('Did you mean:');
                suggestions.forEach(s => console.error(`  - ${s.id} (d=${s.d})`));
            }
            process.exit(1);
        }
    }
    if (options.theme) {
        const themePath = join('tokens/themes', `${options.theme}.json`);
        if (existsSync(themePath)) {
            const themeTokens = JSON.parse(readFileSync(themePath, 'utf8'));
            for (const [id, value] of Object.entries(themeTokens)) {
                engine.commit(id, value);
            }
        }
        else {
            console.warn(`Theme file not found: ${themePath}`);
        }
    }
    let finalResult = {};
    function setDeep(obj, parts, v) {
        let cur = obj;
        for (let i = 0; i < parts.length; i++) {
            const k = parts[i];
            const leaf = i === parts.length - 1;
            if (leaf) {
                const existing = (cur[k] && typeof cur[k] === 'object') ? cur[k] : {};
                cur[k] = { ...existing, $value: v };
            }
            else {
                if (!cur[k] || typeof cur[k] !== 'object')
                    cur[k] = {};
                cur = cur[k];
            }
        }
    }
    function deleteDeep(obj, parts) {
        if (!obj || typeof obj !== 'object')
            return false;
        const [k, ...rest] = parts;
        if (!(k in obj))
            return false;
        if (rest.length === 0) {
            delete obj[k];
        }
        else {
            const child = obj[k];
            const removed = child && typeof child === 'object' ? deleteDeep(child, rest) : false;
            if (removed || (child && typeof child === 'object' && Object.keys(child).length === 0))
                delete obj[k];
        }
        return Object.keys(obj).length === 0;
    }
    // Batch JSON mode
    const rawArgv = process.argv.slice(2);
    const jsonFlagIdx = rawArgv.indexOf('--json');
    let jsonSource = options.json;
    if (!jsonSource && jsonFlagIdx !== -1) {
        const candidate = rawArgv[jsonFlagIdx + 1];
        if (candidate && !candidate.startsWith('--'))
            jsonSource = candidate;
        if (!jsonSource && rawArgv[jsonFlagIdx].includes('=')) {
            const eq = rawArgv[jsonFlagIdx].split('=')[1];
            if (eq)
                jsonSource = eq;
        }
    }
    if (!jsonSource && options.expressions?.includes('-')) {
        jsonSource = '-';
        options.expressions = options.expressions.filter(e => e !== '-');
    }
    if (jsonSource) {
        const fs = await import('node:fs');
        const rawText = jsonSource === '-' ? fs.readFileSync(0, 'utf8') : fs.readFileSync(jsonSource, 'utf8');
        let parsed;
        try {
            parsed = JSON.parse(rawText);
        }
        catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            console.error('Failed to parse JSON batch:', msg);
            process.exit(2);
        }
        if (debugSet) {
            console.log('[set:batch] raw length:', rawText.length);
            if (Array.isArray(parsed))
                console.log('[set:batch] parsed top-level: (array)');
            else if (parsed && typeof parsed === 'object')
                console.log('[set:batch] parsed top-level keys:', Object.keys(parsed));
            else
                console.log('[set:batch] parsed value non-object');
        }
        const batchEntries = normalizeBatch(parsed);
        for (const expr of options.expressions || []) {
            const { id, value } = parseSetExpression(expr);
            batchEntries.push({ id, value });
        }
        for (const u of (options.unset || []))
            batchEntries.push({ id: u, unset: true });
        const map = new Map();
        for (const ent of batchEntries) {
            if (!ent.id)
                continue;
            map.set(ent.id, ent);
        }
        const entries = Array.from(map.values());
        for (const ent of entries)
            ensureKnownOrSuggest(ent.id);
        const debug = process.argv.includes('--debug-set') || process.env.LARISSA_DEBUG_SET === '1';
        if (debug) {
            console.log('[set:batch] parsed entries:');
            for (const e of entries)
                console.log(' ', e);
        }
        const dryRun = process.argv.includes('--dry-run');
        for (const { id, value, unset } of entries) {
            if (unset) {
                if (!options.quiet)
                    console.log(`preview: unset ${id}`);
            }
            else {
                const commitVal = parseValue(String(value));
                if (!options.quiet)
                    console.log(`preview: ${id} = ${commitVal}`);
                if (!dryRun) {
                    const result = engine.commit(id, commitVal);
                    Object.assign(finalResult, result.patch);
                }
            }
        }
        const format = options.format || 'json';
        outputResult(finalResult, format, options.output);
        if (options.write && !dryRun) {
            const path = 'tokens/overrides/local.json';
            let local = {};
            try {
                local = JSON.parse(fs.readFileSync(path, 'utf8'));
            }
            catch { /* new */ }
            for (const { id, value, unset } of entries) {
                if (unset)
                    deleteDeep(local, id.split('.'));
                else
                    setDeep(local, id.split('.'), value);
            }
            fs.mkdirSync('tokens/overrides', { recursive: true });
            fs.writeFileSync(path, JSON.stringify(local, null, 2) + '\n');
            console.log(`✓ Applied ${entries.length} change(s) to ${path}`);
        }
        else if (dryRun && options.write) {
            console.log('Dry-run: changes not written');
        }
        return;
    }
    // Positional expressions path
    for (const expr of options.expressions) {
        const { id, value } = parseSetExpression(expr);
        ensureKnownOrSuggest(id);
        const result = engine.commit(id, value);
        if (!options.quiet) {
            console.log(`Set ${id} = ${value}`);
            if (result.affected.length > 0)
                console.log(`Affected tokens: ${result.affected.join(', ')}`);
            if (result.issues.length > 0)
                console.warn(`Issues: ${result.issues.map(i => i.message).join(', ')}`);
        }
        Object.assign(finalResult, result.patch);
    }
    const format = options.format || 'json';
    outputResult(finalResult, format, options.output);
    if (options.write || (options.unset && options.unset.length)) {
        const fs = await import('node:fs');
        const path = 'tokens/overrides/local.json';
        let local = {};
        try {
            local = JSON.parse(fs.readFileSync(path, 'utf8'));
        }
        catch { /* new */ }
        if (options.write) {
            for (const expr of options.expressions) {
                const { id, value } = parseSetExpression(expr);
                setDeep(local, id.split('.'), value);
            }
        }
        if (options.unset) {
            for (const id of options.unset)
                deleteDeep(local, id.split('.'));
        }
        const total = (options.write ? options.expressions.length : 0) + (options.unset?.length || 0);
        if (total) {
            fs.mkdirSync('tokens/overrides', { recursive: true });
            fs.writeFileSync(path, JSON.stringify(local, null, 2) + '\n', 'utf8');
            console.log(`Persisted override update (${options.write ? options.expressions.length : 0} set, ${options.unset?.length || 0} unset) to ${path}`);
        }
    }
}
