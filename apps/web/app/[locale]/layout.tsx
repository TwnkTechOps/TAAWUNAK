import {NextIntlClientProvider} from 'next-intl';
import '../globals.css';
import {NavigationShell} from '@/components/NavigationShell';
import {Providers} from '@/components/Providers';

export default async function RootLayout({children, params}: {children: React.ReactNode; params: {locale: string}}) {
  const messages = (await import(`@/locales/${params.locale}/common.json`)).default;
  const dir = params.locale === 'ar' ? 'rtl' : 'ltr';
  return (
    <html lang={params.locale} dir={dir} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider locale={params.locale} messages={messages}>
          <Providers>
            <NavigationShell locale={params.locale}>{children}</NavigationShell>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

