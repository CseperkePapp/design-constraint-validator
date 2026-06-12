import { describe, expect, it } from 'vitest';
import { flattenTokens } from '../core/flatten.js';

describe('flattenTokens reference handling', () => {
  it('resolves schema-valid aliases containing underscores', () => {
    const { flat } = flattenTokens({
      color_token: { $value: '#123456' },
      alias: { $value: '{color_token}' },
    });

    expect(flat.alias.value).toBe('#123456');
    expect(flat.alias.refs).toEqual(['color_token']);
  });

  it('escapes reference ids when replacing aliases', () => {
    const { flat } = flattenTokens({
      foo: {
        bar: { $value: 'A' },
      },
      fooXbar: { $value: 'B' },
      joined: { $value: '{foo.bar} {fooXbar}' },
    });

    expect(flat.joined.value).toBe('A B');
  });

  it('preserves original DTCG structured value in raw while normalizing value', () => {
    const color = {
      colorSpace: 'srgb',
      components: [0.5, 0.5, 0.5],
      alpha: 1,
      hex: '#808080',
    };

    const { flat } = flattenTokens({
      color: { $type: 'color', $value: color },
    });

    expect(flat.color.value).toBe('#808080');
    expect(flat.color.raw).toEqual(color);
  });
});

