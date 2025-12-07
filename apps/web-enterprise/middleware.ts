import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['ar', 'en'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
  // Exclude admin routes from locale routing
  pathnames: {
    '/admin': '/admin',
    '/admin/*': '/admin/*'
  }
});

export const config = {
  // Exclude admin, api, and static files from locale routing
  matcher: ['/((?!_next|api|admin|.*\\..*).*)']
};

