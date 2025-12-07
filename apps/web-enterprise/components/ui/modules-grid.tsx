"use client";

import {useState} from "react";
import {useTranslations} from "next-intl";
import Link from "next/link";
import {Layers, Landmark, FileText, BookOpen, Sparkles, MessageSquare} from "lucide-react";

type Segment = "all" | "researchers" | "industry" | "university" | "government";

export function ModulesGrid() {
  const t = useTranslations("home");
  const items = [
    {key: "projects", title: t("moduleProjectsTitle"), desc: t("moduleProjectsDesc"), href: "/projects", seg: ["all","researchers","university"] as Segment[], icon: <Layers size={18}/>},
    {key: "funding", title: t("moduleFundingTitle"), desc: t("moduleFundingDesc"), href: "/funding", seg: ["all","industry","university","government"], icon: <Landmark size={18}/>},
    {key: "proposals", title: t("moduleProposalsTitle"), desc: t("moduleProposalsDesc"), href: "/proposals", seg: ["all","researchers","university"], icon: <FileText size={18}/>},
    {key: "papers", title: t("modulePapersTitle"), desc: t("modulePapersDesc"), href: "/papers", seg: ["all","researchers","university"], icon: <BookOpen size={18}/>},
    {key: "ai", title: t("moduleAiTitle"), desc: t("moduleAiDesc"), href: "/ai", seg: ["all","researchers","industry","university"], icon: <Sparkles size={18}/>},
    {key: "comms", title: t("moduleCommsTitle"), desc: t("moduleCommsDesc"), href: "/comms", seg: ["all","researchers","industry","university","government"], icon: <MessageSquare size={18}/>},
  ];
  const [seg, setSeg] = useState<Segment>("all");
  const labels: Record<Segment,string> = {
    all: t("segAll"),
    researchers: t("segResearchers"),
    industry: t("segIndustry"),
    university: t("segUniversity"),
    government: t("segGovernment")
  };
  const filtered = items.filter(i => i.seg.includes(seg));
  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2">
        {(Object.keys(labels) as Segment[]).map(s => (
          <button key={s} onClick={() => setSeg(s)} className={`rounded-full border px-3 py-1 text-xs ${seg===s ? "bg-emerald-600 text-white border-emerald-600" : "hover:bg-gray-50 dark:border-gray-800"}`}>
            {labels[s]}
          </button>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((m) => (
          <div key={m.key} className="group relative overflow-hidden rounded-2xl card-2025 shadow-ambient p-6 transition hover:shadow-lg hover-pop reveal">
            <div className="pointer-events-none absolute inset-0 -z-10 opacity-0 blur-2xl transition-opacity group-hover:opacity-100"
                 style={{background: 'radial-gradient(50% 50% at 50% 0%, rgba(16,185,129,.20), transparent 70%)'}} />
            <div className="flex items-center gap-3 text-lg font-semibold">
              <span className="rounded-full p-[1px] bg-gradient-to-br from-emerald-400/60 via-emerald-600/60 to-amber-500/60">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-brand dark:bg-gray-950">
                  {m.icon}
                </span>
              </span>
              <span>{m.title}</span>
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-200">{m.desc}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={m.href} className="rounded-full border px-3 py-1 text-xs hover:bg-gray-50 dark:border-gray-700">{t("learnMore")}</Link>
              <Link href={m.href} className="rounded-full bg-brand px-3 py-1 text-xs text-white hover:bg-brand-700" aria-label={`${m.title} — Open`}>Open</Link>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}


