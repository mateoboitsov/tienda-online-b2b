import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Optimizaciones para Turbopack (Next.js 16 por defecto)
  turbopack: {},

  // Configuración de webpack para mejor estabilidad (mantenido por compatibilidad)
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },

  // Configuración de headers para mejor compatibilidad
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },

  // Configuración de imágenes migrada a remotePatterns
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
      }
    ],
    unoptimized: true,
  },

  // Configuración para Netlify
  output: 'standalone',

  // Configuración de trailing slash
  trailingSlash: false,

  // Configuración de TypeScript
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
