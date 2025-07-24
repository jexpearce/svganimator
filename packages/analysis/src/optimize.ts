import { optimize, Config } from 'svgo';

const svgoConfig: Config = {
  multipass: true,
  floatPrecision: 2,
  plugins: [
    'preset-default',
    { name: 'removeViewBox', active: false },
    { name: 'cleanupIds', active: true },
    { name: 'removeUselessStrokeAndFill', active: false },
    {
      name: 'removeUnknownsAndDefaults',
      params: { keepAriaAttrs: true, keepRoleAttr: true }
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