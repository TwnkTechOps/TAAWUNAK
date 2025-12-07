import {getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async ({locale}) => {
  // Supported locales are defined in middleware; guard here as well
  const supported = ['ar', 'en'];
  const safeLocale = supported.includes(locale) ? locale : 'ar';
  const messages = (await import(`../locales/${safeLocale}/common.json`)).default;

  return {
    locale: safeLocale,
    messages
  };
});

