import {NextIntlClientProvider} from 'next-intl';
import {getLocale, getMessages} from 'next-intl/server';
import "styles/tailwind.css"
import { Topbar } from "components/Nav/Topbar"
import { AdminSidebar } from "components/Nav/AdminSidebar"
import { RouteProgress } from "components/RouteProgress"

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        <link rel="prefetch" href="/dashboard" />
        <link rel="prefetch" href="/projects" />
        <link rel="prefetch" href="/funding" />
        <link rel="prefetch" href="/proposals" />
        <link rel="prefetch" href="/papers" />
      </head>
      <body className="surface-gradient min-h-screen" suppressHydrationWarning>
        <a href="#main" className="skip-link">Skip to content</a>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <RouteProgress />
          <Topbar />
          <AdminSidebar />
          <div id="main">{children}</div>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
