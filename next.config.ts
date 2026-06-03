import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./lib/i18n.ts');

const nextConfig: NextConfig = {
  // Strict mode za bolji development experience
  reactStrictMode: true,

  // Paketi koji se izvršavaju samo na serveru
  serverExternalPackages: ['xlsx', 'jspdf', 'jspdf-autotable'],

  // Webpack konfiguracija za xlsx i jspdf
  webpack: (config) => {
    // xlsx koristi fs i path koji nisu dostupni u browser-u
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      stream: false,
      buffer: false,
    };
    return config;
  },

  // Bezbednosni header-i
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
