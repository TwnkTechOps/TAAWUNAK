"use client";

import {useTranslations} from 'next-intl';
import Link from 'next/link';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {StatCard} from '@/components/ui/stat-card';
import {Briefcase, Landmark, FileText, Building2, ArrowRight} from 'lucide-react';

export default function Home() {
  const t = useTranslations('home');
  return (
    <div className="p-6 space-y-8">
      {/* Hero */}
      <section className="rounded-xl border bg-gradient-to-br from-white to-gray-50 p-6 shadow-sm">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
          <p className="text-gray-600">{t('subtitle')}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link href="./projects"><Button>{t('cta.startProject')}</Button></Link>
            <Link href="./funding"><Button variant="secondary">{t('cta.findFunding')}</Button></Link>
          </div>
        </div>
      </section>

      {/* KPIs */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t('kpi.projects')} value="42" delta={t('kpi.deltaUp', {value: '12%'})} icon={<Briefcase size={18} />} />
        <StatCard label={t('kpi.funding')} value="SAR 8.2M" delta={t('kpi.deltaUp', {value: '5%'})} icon={<Landmark size={18} />} />
        <StatCard label={t('kpi.papers')} value="128" delta={t('kpi.updated')} icon={<FileText size={18} />} />
        <StatCard label={t('kpi.partners')} value="17" delta={t('kpi.updated')} icon={<Building2 size={18} />} />
      </section>

      {/* Quick actions */}
      <section className="grid gap-4 md:grid-cols-2">
        <Card className="transition hover:shadow">
          <CardHeader><CardTitle>{t('cards.projects')}</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">{t('cards.projectsDesc')}</p>
            <div className="mt-3">
              <Link href="./projects"><Button variant="ghost" className="text-brand inline-flex items-center gap-1">{t('cards.open')} <ArrowRight size={16} /></Button></Link>
            </div>
          </CardContent>
        </Card>
        <Card className="transition hover:shadow">
          <CardHeader><CardTitle>{t('cards.funding')}</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">{t('cards.fundingDesc')}</p>
            <div className="mt-3">
              <Link href="./funding"><Button variant="ghost" className="text-brand inline-flex items-center gap-1">{t('cards.open')} <ArrowRight size={16} /></Button></Link>
            </div>
          </CardContent>
        </Card>
        <Card className="transition hover:shadow">
          <CardHeader><CardTitle>{t('cards.proposals')}</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">{t('cards.proposalsDesc')}</p>
            <div className="mt-3">
              <Link href="./proposals"><Button variant="ghost" className="text-brand inline-flex items-center gap-1">{t('cards.open')} <ArrowRight size={16} /></Button></Link>
            </div>
          </CardContent>
        </Card>
        <Card className="transition hover:shadow">
          <CardHeader><CardTitle>{t('cards.papers')}</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">{t('cards.papersDesc')}</p>
            <div className="mt-3">
              <Link href="./papers"><Button variant="ghost" className="text-brand inline-flex items-center gap-1">{t('cards.open')} <ArrowRight size={16} /></Button></Link>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Latest activity & quick links */}
      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="transition">
          <CardHeader><CardTitle>Latest activity</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 h-2 w-2 rounded-full bg-green-500" />
                <div><b>Proposal approved</b> — Arabic NLP for Education</div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 h-2 w-2 rounded-full bg-blue-500" />
                <div><b>New funding call</b> — AI in Education 2025</div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 h-2 w-2 rounded-full bg-amber-500" />
                <div><b>Paper submitted</b> — Federated Learning in K‑12</div>
              </li>
            </ul>
          </CardContent>
        </Card>
        <Card className="transition">
          <CardHeader><CardTitle>Quick links</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2">
              <Link href="./projects/new"><Button variant="secondary">Create project</Button></Link>
              <Link href="./funding"><Button variant="secondary">Browse funding</Button></Link>
              <Link href="./proposals/new"><Button variant="secondary">Submit proposal</Button></Link>
              <Link href="./papers/new"><Button variant="secondary">Submit paper</Button></Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

