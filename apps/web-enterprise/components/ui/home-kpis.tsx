 "use client";
 
import {useLocale, useTranslations} from "next-intl";
 import {Activity, Banknote, FileText, Building2, Users, Zap, Timer, ShieldCheck} from "lucide-react";
 import {useEffect, useState} from "react";
import { localizeDigits } from "lib/i18n";
 
 type CardProps = {
   icon: React.ReactNode;
   title: string;
   value: string;
   delta: string;
   trend?: number[];
 };
 
 function Sparkline({points, stroke = "var(--brand-600)"}: {points: number[]; stroke?: string}) {
   const width = 140;
   const height = 40;
   const min = Math.min(...points);
   const max = Math.max(...points);
   const norm = (v: number) => {
     if (max === min) return height / 2;
     return height - ((v - min) / (max - min)) * height;
   };
   const step = width / (points.length - 1);
   const d = points.map((p, i) => `${i === 0 ? "M" : "L"} ${i * step} ${norm(p)}`).join(" ");
   return (
     <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-10 overflow-visible">
       <defs>
         <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
           <stop offset="0%" stopColor="var(--brand-600)" stopOpacity="0.35" />
           <stop offset="100%" stopColor="var(--brand-600)" stopOpacity="0" />
         </linearGradient>
       </defs>
       <path d={d} fill="none" stroke={stroke} strokeWidth="2" />
       <path d={`${d} L ${width} ${height} L 0 ${height} Z`} fill="url(#sparkFill)" />
     </svg>
   );
 }
 
function Card({icon, title, value, delta, trend}: CardProps) {
  const locale = useLocale();
   const [display, setDisplay] = useState("0");
   const positive = delta.trim().startsWith("+");
   useEffect(() => {
     const target = Number(String(value).replace(/[^\d.]/g, "")) || 0;
     let n = 0;
     const steps = 20;
     const inc = target / steps;
     const id = window.setInterval(() => {
       n += inc;
       setDisplay(target % 1 ? n.toFixed(1) : Math.round(n).toString());
       if (n >= target) { setDisplay(String(value)); window.clearInterval(id); }
     }, 30);
     return () => window.clearInterval(id);
   }, [value]);
   const series = trend ?? Array.from({length: 16}).map((_, i) => Math.round(20 + Math.sin(i/2)*8 + i));
  return (
    <div className="group card-2025 elevated-2025 shadow-ambient rounded-xl p-5 transition hover:shadow-md dark:border-gray-800 reveal">
       <div className="flex items-start gap-3">
         <div className="animate-float rounded-lg bg-emerald-50 p-2 text-brand dark:bg-emerald-900/30">
           {icon}
         </div>
         <div className="min-w-0">
           <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{title}</div>
          <div className="mt-1 text-3xl font-semibold text-gray-900 md:text-4xl dark:text-white">{localizeDigits(display, locale)}</div>
          <div className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${positive ? "text-emerald-700 bg-emerald-50" : "text-gray-600 bg-gray-100"} dark:bg-emerald-900/30 dark:text-emerald-300`}>
            {localizeDigits(delta, locale)}
           </div>
         </div>
       </div>
       <div className="mt-3">
         <Sparkline points={series} />
       </div>
     </div>
   );
 }
 
 export function HomeKpis() {
   const t = useTranslations("home");
   const [density, setDensity] = useState<"cozy" | "compact">("cozy");
   const densityPad = density === "compact" ? "p-4" : "p-5";
   const sectionPad = density === "compact" ? "py-6" : "py-10";
   return (
     <section className={`mx-auto max-w-(--breakpoint-xl) px-5 ${sectionPad}`}>
       <div className="mb-3 flex items-center justify-end gap-2">
         <button
           onClick={() => setDensity(density === "cozy" ? "compact" : "cozy")}
           className="rounded-full border px-3 py-1 text-xs text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
           aria-label="Toggle density"
         >
           {density === "cozy" ? "Compact" : "Comfortable"}
         </button>
       </div>
       <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
         <div className={densityPad}><Card icon={<Activity size={18}/>} title={t("kpiActiveProjects")} value="42" delta="+12% this month" /></div>
         <div className={densityPad}><Card icon={<Banknote size={18}/>} title={t("kpiFundingSecured")} value="SAR 8.2M" delta="+5% this month" /></div>
         <div className={densityPad}><Card icon={<FileText size={18}/>} title={t("kpiPapers")} value="128" delta="+3% this month" /></div>
         <div className={densityPad}><Card icon={<Building2 size={18}/>} title={t("kpiPartners")} value="17" delta="Updated now" /></div>
       </div>
     </section>
   );
 }
 
export function SecondaryStats() {
  const t = useTranslations("home");
  const locale = useLocale();
   return (
     <section className="mx-auto max-w-(--breakpoint-xl) px-5 pb-8">
       <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Mini label={t("secondaryResearchers")} value={localizeDigits("3,240", locale)} icon={<Users size={16}/>}/>
        <Mini label={t("secondaryAiMatches")} value={localizeDigits("186", locale)} icon={<Zap size={16}/>}/>
        <Mini label={t("secondaryReviewTime")} value={localizeDigits("6.5 days", locale)} icon={<Timer size={16}/>}/>
        <Mini label={t("secondaryMfa")} value={localizeDigits("78%", locale)} icon={<ShieldCheck size={16}/>}/>
       </div>
     </section>
   );
 }
 
 function Mini({label, value, icon}: {label: string; value: string; icon: React.ReactNode}) {
   return (
    <div className="flex items-center gap-3 rounded-xl border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="rounded-md bg-emerald-50 p-1.5 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">{icon}</div>
       <div>
        <div className="text-xs text-gray-500 dark:text-gray-300">{label}</div>
        <div className="text-sm font-semibold dark:text-gray-100">{value}</div>
       </div>
     </div>
   );
 }


