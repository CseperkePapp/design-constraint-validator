// cli/graph-poset.ts
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { buildPoset, transitiveReduction, toMermaidHasse, toDotHasse, validatePoset, type Order } from "../core/poset";

export interface OrderFile {
  $description?: string;
  order: Order[];
}

export function loadOrderFile(path: string): OrderFile {
  if (!existsSync(path)) {
    throw new Error(`Order file not found: ${path}`);
  }
  return JSON.parse(readFileSync(path, "utf8"));
}

export function generateHasseDiagram(orderPath: string, outputPath: string, format: 'mermaid' | 'dot' = 'mermaid'): void {
  const orderData = loadOrderFile(orderPath);
  const { order, $description } = orderData;
  
  // Build and validate poset
  const poset = buildPoset(order);
  const validation = validatePoset(poset);
  
  if (!validation.valid) {
    console.error("⚠️  Warning: Poset contains cycles:");
    for (const cycle of validation.cycles || []) {
      console.error(`   ${cycle.join(" → ")}`);
    }
  }
  
  // Generate Hasse diagram (transitive reduction)
  const hasse = transitiveReduction(poset);
  
  const title = $description || "Poset Hierarchy";
  const diagram = format === 'mermaid' 
    ? toMermaidHasse(hasse, { title })
    : toDotHasse(hasse, { title });
  
  // Ensure output directory exists
  mkdirSync(outputPath.split('/').slice(0, -1).join('/'), { recursive: true });
  
  writeFileSync(outputPath, diagram);
  console.log(`✅ Generated ${format.toUpperCase()} Hasse diagram: ${outputPath}`);
  
  if (!validation.valid) {
    console.log(`⚠️  Note: Diagram shows cycles that should be resolved`);
  }
}

export function generateAllHasseDiagrams(themesDir: string = "themes", outputDir: string = "dist/graphs"): void {
  const orderFiles = [
    { file: "typography.order.json", name: "typography" },
    { file: "spacing.order.json", name: "spacing" }
  ];
  
  mkdirSync(outputDir, { recursive: true });
  
  for (const { file, name } of orderFiles) {
    const orderPath = `${themesDir}/${file}`;
    
    if (existsSync(orderPath)) {
      try {
        // Generate both Mermaid and DOT formats
        generateHasseDiagram(orderPath, `${outputDir}/${name}-hasse.mmd`, 'mermaid');
        generateHasseDiagram(orderPath, `${outputDir}/${name}-hasse.dot`, 'dot');
      } catch (error) {
        console.error(`❌ Failed to generate diagram for ${name}:`, error);
      }
    } else {
      console.log(`⏭️  Skipping ${name} (no order file found)`);
    }
  }
}
