"use client";

import {useTranslations} from "next-intl";

export function Testimonials() {
  const t = useTranslations("home");
  const items = [
    {quote: t("testimonial1_quote"), by: t("testimonial1_by")},
    {quote: t("testimonial2_quote"), by: t("testimonial2_by")},
    {quote: t("testimonial3_quote"), by: t("testimonial3_by")}
  ];
  return (
    <section className="mx-auto max-w-(--breakpoint-xl) px-5 py-12">
      <h3 className="mb-5 text-center text-xl font-semibold">{t("testimonialsTitle")}</h3>
      <div className="grid gap-4 md:grid-cols-3">
        {items.map((it, i) => (
          <figure key={i} className="rounded-2xl border bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <blockquote className="text-sm text-gray-700 dark:text-gray-300">“{it.quote}”</blockquote>
            <figcaption className="mt-3 text-xs text-gray-500 dark:text-gray-400">— {it.by}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}


