export type RGBA = {
    r: number;
    g: number;
    b: number;
    a: number;
};
export declare function srgbToLin(c: number): number;
export declare function linToSrgb(c: number): number;
export declare function relativeLuminance(rgb: RGBA): number;
export declare function contrastRatio(L1: number, L2: number): number;
export declare function parseCssColor(input: string | undefined | null): RGBA | null;
export declare function compositeOver(fg: RGBA, bg: RGBA): RGBA;
export declare function isOpaque(c: RGBA): boolean;
//# sourceMappingURL=color.d.ts.map