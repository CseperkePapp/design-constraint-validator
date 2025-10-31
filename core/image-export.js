// core/image-export.ts
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
function which(cmd) {
    const paths = (process.env.PATH || "").split(path.delimiter);
    for (const p of paths) {
        const full = path.join(p, cmd + (process.platform === "win32" ? ".cmd" : ""));
        try {
            fs.accessSync(full, fs.constants.X_OK);
            return full;
        }
        catch {
            // File not accessible, continue to next path
        }
    }
    return null;
}
export function exportGraphImage(inputPath, // .mmd or .dot we just wrote
outPath, // .svg or .png to write
fmt, // "svg" | "png"
renderer // "mermaid" | "dot"
) {
    if (renderer === "mermaid") {
        const mmdc = which("mmdc");
        if (!mmdc) {
            return { ok: false, hint: "Install @mermaid-js/mermaid-cli (mmdc) to render images. Fallback written: .mmd" };
        }
        const args = ["-i", inputPath, "-o", outPath, "-t", "default", "-b", "transparent"];
        if (fmt === "png")
            args.push("-p", "puppeteer-config.json"); // optional, if you keep one
        const res = spawnSync(mmdc, args, { stdio: "inherit" });
        return { ok: res.status === 0, hint: res.status !== 0 ? "mmdc failed; see logs." : undefined };
    }
    // renderer === "dot"
    const dot = which("dot");
    if (!dot) {
        return { ok: false, hint: "Install Graphviz (dot) to render images. Fallback written: .dot" };
    }
    const argFmt = fmt === "svg" ? "-Tsvg" : "-Tpng";
    const res = spawnSync(dot, [argFmt, inputPath, "-o", outPath], { stdio: "inherit" });
    return { ok: res.status === 0, hint: res.status !== 0 ? "dot failed; see logs." : undefined };
}
