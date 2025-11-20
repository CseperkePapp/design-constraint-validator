import { describe, it, expect } from 'vitest';
import { buildPoset, transitiveReduction, validatePoset, toMermaidHasse, type Order } from '../core/poset';
import { MonotonicPlugin, parseSize } from '../core/constraints/monotonic';
import { Engine } from '../core/engine';

describe('Poset and Hasse diagrams', () => {
  it('should build correct poset from order constraints', () => {
    const orders: Order[] = [
      ["h1", ">=", "h2"],
      ["h2", ">=", "h3"], 
      ["h3", ">=", "h4"]
    ];
    
    const poset = buildPoset(orders);
    
    expect(poset.get("h1")).toEqual(new Set(["h2"]));
    expect(poset.get("h2")).toEqual(new Set(["h3"]));
    expect(poset.get("h3")).toEqual(new Set(["h4"]));
  });

  it('should perform transitive reduction correctly', () => {
    const orders: Order[] = [
      ["h1", ">=", "h2"],
      ["h2", ">=", "h3"],
      ["h1", ">=", "h3"], // This should be removed by transitive reduction
    ];
    
    const poset = buildPoset(orders);
    const hasse = transitiveReduction(poset);
    
    // h1 -> h3 should be removed since h1 -> h2 -> h3 exists
    expect(hasse.get("h1")).toEqual(new Set(["h2"]));
    expect(hasse.get("h2")).toEqual(new Set(["h3"]));
    expect(hasse.get("h3")).toEqual(new Set());
  });

  it('should validate poset and detect cycles', () => {
    const validOrders: Order[] = [
      ["a", ">=", "b"],
      ["b", ">=", "c"]
    ];
    
    const cyclicOrders: Order[] = [
      ["a", ">=", "b"],
      ["b", ">=", "c"], 
      ["c", ">=", "a"]
    ];
    
    const validPoset = buildPoset(validOrders);
    const cyclicPoset = buildPoset(cyclicOrders);
    
    expect(validatePoset(validPoset).valid).toBe(true);
    expect(validatePoset(cyclicPoset).valid).toBe(false);
    expect(validatePoset(cyclicPoset).cycles).toBeDefined();
  });

  it('should generate Mermaid Hasse diagram', () => {
    const orders: Order[] = [
      ["h1", ">=", "h2"],
      ["h2", ">=", "h3"]
    ];
    
    const poset = buildPoset(orders);
    const hasse = transitiveReduction(poset);
    const mermaid = toMermaidHasse(hasse, { title: "Test Hierarchy" });
    
    expect(mermaid).toContain('flowchart TD');
    expect(mermaid).toContain('Test Hierarchy');
    expect(mermaid).toContain('"h1" --> "h2"');
    expect(mermaid).toContain('"h2" --> "h3"');
  });
});

describe('Monotonic constraints', () => {
  it('should validate size ordering correctly', () => {
    const orders: Order[] = [
      ["typography.size.h1", ">=", "typography.size.h2"],
      ["typography.size.h2", ">=", "typography.size.h3"]
    ];
    
    const validValues = {
      "typography.size.h1": "2rem",
      "typography.size.h2": "1.5rem", 
      "typography.size.h3": "1rem"
    };
    
    const invalidValues = {
      "typography.size.h1": "1rem",
      "typography.size.h2": "1.5rem",  // h2 > h1, violates constraint
      "typography.size.h3": "0.8rem"
    };
    
    const plugin = MonotonicPlugin(orders, parseSize);
    
    // Test valid values
    const validEngine = new Engine(validValues, []);
    const validIssues = plugin.evaluate(validEngine, new Set(["typography.size.h1", "typography.size.h2", "typography.size.h3"]));
    expect(validIssues).toHaveLength(0);
    
    // Test invalid values
    const invalidEngine = new Engine(invalidValues, []);
    const invalidIssues = plugin.evaluate(invalidEngine, new Set(["typography.size.h1", "typography.size.h2", "typography.size.h3"]));
    expect(invalidIssues).toHaveLength(1);
    expect(invalidIssues[0].rule).toBe("monotonic");
    expect(invalidIssues[0].message).toContain("typography.size.h1 >= typography.size.h2 violated");
  });

  it('should parse different size units correctly', () => {
    expect(parseSize("1rem")).toBe(16);
    expect(parseSize("24px")).toBe(24);
    expect(parseSize("1.5rem")).toBe(24);
    expect(parseSize("invalid")).toBe(null);
    expect(parseSize(123)).toBe(null);
  });

  it('should integrate with engine constraint system', () => {
    const orders: Order[] = [
      ["size.lg", ">=", "size.md"],
      ["size.md", ">=", "size.sm"]
    ];
    
    const values = {
      "size.lg": "1.5rem",
      "size.md": "1rem", 
      "size.sm": "0.875rem"
    };
    
    const engine = new Engine(values, []);
    engine.use(MonotonicPlugin(orders, parseSize));
    
    // Test valid state
    const validIssues = engine.evaluate(new Set(["size.lg", "size.md", "size.sm"]));
    expect(validIssues).toHaveLength(0);
    
    // Test constraint violation after change
    engine.set("size.sm", "2rem"); // Makes sm > lg, violating constraint
    const invalidIssues = engine.evaluate(new Set(["size.lg", "size.md", "size.sm"]));
    expect(invalidIssues.length).toBeGreaterThan(0);
    expect(invalidIssues.some(issue => issue.rule === "monotonic")).toBe(true);
  });
});
