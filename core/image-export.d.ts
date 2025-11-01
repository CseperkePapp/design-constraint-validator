export type ImageFmt = "svg" | "png";
export type Renderer = "mermaid" | "dot";
export declare function exportGraphImage(inputPath: string, // .mmd or .dot we just wrote
outPath: string, // .svg or .png to write
fmt: ImageFmt, // "svg" | "png"
renderer: Renderer): {
    ok: boolean;
    hint?: string;
};
//# sourceMappingURL=image-export.d.ts.map