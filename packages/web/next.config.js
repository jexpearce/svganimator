/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Disable SSR for the animation preview components
    appDir: true,
  },
  webpack: (config) => {
    // Handle ESM packages
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts'],
      '.jsx': ['.jsx', '.tsx']
    };
    // Stub out node built-ins used by jsdom
    config.resolve.fallback = {
      ...config.resolve.fallback,
      net: false,
      tls: false,
      fs: false,
    };
    return config;
  },
  transpilePackages: [
    '@motif/schema',
    '@motif/analysis', 
    '@motif/primitives',
    '@motif/react',
    '@motif/utils'
  ]
};

export default nextConfig; 