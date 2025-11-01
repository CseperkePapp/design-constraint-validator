import { type Order } from "../core/poset.js";
export interface OrderFile {
    $description?: string;
    order: Order[];
}
export declare function loadOrderFile(path: string): OrderFile;
export declare function generateHasseDiagram(orderPath: string, outputPath: string, format?: 'mermaid' | 'dot'): void;
export declare function generateAllHasseDiagrams(themesDir?: string, outputDir?: string): void;
//# sourceMappingURL=graph-poset.d.ts.map