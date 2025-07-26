/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Disable SSR for the animation preview components
    appDir: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    // Handle ESM packages
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts'],
      '.jsx': ['.jsx', '.tsx']
    };
    
    // Exclude Node.js modules from client bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        path: false,
        os: false,
        child_process: false,
      };
    }
    
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