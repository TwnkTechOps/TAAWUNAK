import {getRequestConfig} from 'next-intl/server';

// Compatible config for current next-intl in node_modules
export default getRequestConfig(async ({locale}) => {
  const supported = ['ar', 'en'];
  const safe = locale && supported.includes(locale) ? (locale as string) : 'en';
  const messages = (await import(`../locales/${safe}/common.json`)).default;
  return {locale: safe, messages};
});

