import { describe, expect, it } from 'vitest';
import { contrastRatio, parseCssColor, relativeLuminance } from '../core/color.js';
import { Engine } from '../core/engine.js';
import { WcagContrastPlugin } from '../core/constraints/wcag.js';

function validateWcagPair(foreground: string, background: string, min: number) {
  const engine = new Engine(
    {
      'color.text': foreground,
      'color.bg': background,
    },
    []
  ).use(WcagContrastPlugin([{ fg: 'color.text', bg: 'color.bg', min }]));

  return engine.evaluate(new Set(['color.text', 'color.bg']));
}

describe('CSS color parsing', () => {
  it('converts OKLCH to gamma-encoded sRGB', () => {
    const color = parseCssColor('oklch(0.67 0.09 195)');

    expect(color).not.toBeNull();
    expect(color!.r).toBeCloseTo(69.7, 1);
    expect(color!.g).toBeCloseTo(166.5, 1);
    expect(color!.b).toBeCloseTo(166.3, 1);
    expect(relativeLuminance(color!)).toBeCloseTo(0.315, 3);
  });

  it('reports true contrast for dark OKLCH on light OKLCH', () => {
    const fg = parseCssColor('oklch(0 0 0)');
    const bg = parseCssColor('oklch(0.67 0.09 195)');

    expect(fg).not.toBeNull();
    expect(bg).not.toBeNull();

    const ratio = contrastRatio(relativeLuminance(fg!), relativeLuminance(bg!));
    expect(ratio).toBeCloseTo(7.3, 1);
    expect(ratio).toBeGreaterThan(7);
  });

  it('preserves OKLCH alpha values', () => {
    const decimalAlpha = parseCssColor('oklch(67% 0.09 195 / 0.4)');
    const percentAlpha = parseCssColor('oklch(67% 0.09 195 / 40%)');

    expect(decimalAlpha?.a).toBeCloseTo(0.4, 5);
    expect(percentAlpha?.a).toBeCloseTo(0.4, 5);
  });
});

describe('WCAG validator color input formats', () => {
  it('preserves expected contrast behavior for supplied sRGB CSS colors', () => {
    expect(validateWcagPair('#111111', '#ffffff', 7)).toEqual([]);
    expect(validateWcagPair('rgb(17, 17, 17)', 'rgb(255, 255, 255)', 7)).toEqual([]);
    expect(validateWcagPair('#888888', '#999999', 4.5)).toHaveLength(1);
  });

  it('uses corrected OKLCH conversion for supplied OKLCH CSS colors', () => {
    const issues = validateWcagPair('oklch(0 0 0)', 'oklch(0.67 0.09 195)', 7);

    expect(issues).toEqual([]);
  });

  it('resolves backdrop token ids that start with CSS color function names', () => {
    const engine = new Engine(
      {
        'color.text': '#000000',
        'color.bg': 'rgba(255, 255, 255, 0.5)',
        'rgb.backdrop': '#ffffff',
      },
      []
    ).use(
      WcagContrastPlugin([
        { fg: 'color.text', bg: 'color.bg', backdrop: 'rgb.backdrop', min: 4.5, where: 'prefixed token id' },
      ])
    );

    expect(engine.evaluate(new Set(engine.getAllIds()))).toEqual([]);
  });
});
