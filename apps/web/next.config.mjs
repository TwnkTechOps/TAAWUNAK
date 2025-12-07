import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

export default withNextIntl({
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {key: 'X-Frame-Options', value: 'DENY'},
          {key: 'X-Content-Type-Options', value: 'nosniff'},
          {key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin'},
          // Keep Permissions-Policy minimal and non-breaking for dev
          {key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()'}
        ]
      }
    ];
  }
});

