import Link from "next/link";

export function PageHeader(props: {title: string; description?: string; actions?: React.ReactNode; breadcrumb?: Array<{href: string; label: string}>}) {
  const {title, description, actions, breadcrumb} = props;
  return (
    <div className="border-b bg-white/70 backdrop-blur-sm dark:bg-gray-950/40">
      <div className="mx-auto flex max-w-(--breakpoint-xl) items-end justify-between gap-3 px-5 py-5">
        <div>
          {breadcrumb && (
            <nav className="mb-1 text-xs text-gray-600 dark:text-gray-400">
              {breadcrumb.map((b, i) => (
                <span key={b.href}>
                  <Link href={b.href} className="hover:underline">{b.label}</Link>
                  {i < breadcrumb.length - 1 && <span className="mx-1">/</span>}
                </span>
              ))}
            </nav>
          )}
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description && <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}


