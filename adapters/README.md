# Adapters

DCV supports multiple **input shapes** via lightweight adapters that normalize external token formats into DCV's internal model.

## Goals
- Accept common design-token ecosystems with zero/low friction.
- Preserve **IDs** and **provenance** so diagnostics remain meaningful.
- Avoid mutation: adapters are **pure mappings**.

## Currently targeted
- **Style Dictionary** (`*.json`)  
  - Map `tokens.foo.bar.value` → DCV node id `tokens.foo.bar`
  - Preserve `type`, `description` if present
- **Tokens Studio JSON** (Figma plugin export)  
  - Map `$value`, `$type`, `$description` to DCV fields
- **DTCG** schema
  - Normalize `value`, `type`, `extensions` to DCV keys

## Minimal internal shape (simplified)

```ts
type DCVToken = {
  id: string;                 // stable dot-path id
  type?: string;              // 'color' | 'dimension' | ...
  value: unknown;             // normalized primitive (hex, number, etc.)
  meta?: Record<string, any>; // passthrough fields (description, file, source)
};
```

## Writing a custom adapter

```ts
export function fromMyFormat(json: any): DCVToken[] {
  // 1) walk your input
  // 2) produce DCVToken[] with stable ids & normalized values
  // 3) do not throw on unknown fields; pass through to meta
  return tokens;
}
```

**Tip:** Keep **IDs stable**; diagnostics and graphs depend on them.

## Policy inputs

Policies are separate JSONs (e.g., AA, AAA, org presets).
Adapters do **not** alter policy files; they only map tokens.
