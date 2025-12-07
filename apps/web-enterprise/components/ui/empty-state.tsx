"use client";

import Link from "next/link";

export function EmptyState(props: {title: string; description?: string; action?: {href: string; label: string}}) {
  const {title, description, action} = props;
  return (
    <div className="flex flex-col items-center justify-center rounded border py-12 text-center dark:border-gray-800">
      <div className="text-lg font-medium">{title}</div>
      {description && <div className="mt-1 max-w-md text-sm text-gray-600 dark:text-gray-400">{description}</div>}
      {action && (
        <Link href={action.href} className="mt-4 rounded bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700">
          {action.label}
        </Link>
      )}
    </div>
  );
}


