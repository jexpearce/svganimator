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
          removeViewBox: false,
          cleanupIds: true,
          removeUselessStrokeAndFill: false,
          removeUnknownsAndDefaults: {
            keepAriaAttrs: true,
            keepRoleAttr: true,
          },
        },
      },
    } as any,
  ],
};

/**
 * Optimizes an SVG string using SVGO
 */
export async function optimizeSvg(sanitized: string): Promise<string> {
  const result = optimize(sanitized, svgoConfig);
  return result.data;
} 