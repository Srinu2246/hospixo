/** @type {import('next').NextConfig} */
const nextConfig = {
  // Avoid dev-only double mount that aborts in-flight React Query fetches (shows as "canceled").
  reactStrictMode: false,
  reactCompiler: true,
  turbopack: {},
  env: {
    NEXT_PUBLIC_GROWTHBOOK_CLIENT_KEY:
      process.env.NEXT_PUBLIC_GROWTHBOOK_CLIENT_KEY || process.env.VITE_GROWTHBOOK_CLIENT_KEY || '',
    NEXT_PUBLIC_GROWTHBOOK_API_HOST:
      process.env.NEXT_PUBLIC_GROWTHBOOK_API_HOST || 'https://cdn.growthbook.io',
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.module.rules.push({
        test: /\.(tsx|ts|jsx|js)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: '@locator/webpack-loader',
            options: {
              env: 'development',
            },
          },
        ],
      });
    }
    return config;
  },
};

export default nextConfig;
