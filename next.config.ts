import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactCompiler: true,
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
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
