import { optimize, Config } from 'svgo';

const svgoConfig: Config = {
  multipass: true,
  floatPrecision: 2,
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          convertShapeToPath: false,
          collapseGroups: false
        }
      }
    },
    { name: 'cleanupIds' },
    {
      name: 'removeUnknownsAndDefaults',
      params: { keepAriaAttrs: true, keepRoleAttr: true }
    },
    {
      name: 'convertColors',
      params: { shorthex: true, shortname: false }
    }
  ]
};

/**
 * Optimizes an SVG string using SVGO
 */
export async function optimizeSvg(sanitized: string): Promise<string> {
  const result = optimize(sanitized, svgoConfig);
  return result.data;
} 