/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  turbopack: {},
  async redirects() {
    return [
      {
        source: '/branch-manager/management/floor-and-table-setup',
        destination: '/branch/floor-table-setup',
        permanent: false,
      },
      {
        source: '/branch-manager/management/floor-and-table-setup/floors/:floorId/sections',
        destination: '/branch/floor-table-setup/:floorId?tab=sections',
        permanent: false,
      },
      {
        source: '/branch-manager/management/floor-and-table-setup/floors/:floorId',
        destination: '/branch/floor-table-setup/:floorId',
        permanent: false,
      },
    ];
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
