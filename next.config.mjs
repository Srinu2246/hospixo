const isLocatorEnabled = process.env.NEXT_PUBLIC_ENABLE_LOCATOR === 'true';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Avoid dev-only double mount that aborts in-flight React Query fetches (shows as "canceled").
  reactStrictMode: false,
  reactCompiler: true,
  turbopack: isLocatorEnabled
    ? {
        rules: {
          '**/*.{tsx,jsx}': {
            loaders: [
              {
                loader: '@locator/webpack-loader',
                options: {
                  env: 'development',
                },
              },
            ],
          },
        },
      }
    : {},
  webpack: (config, { dev }) => {
    if (dev && isLocatorEnabled) {
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
