"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Layers, Landmark, FileText, BookOpen, Sparkles, MessageSquare, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "components/Button/Button";
import { Card, CardContent } from "components/Card/Card";

type Feature = {
  key: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  benefits: string[];
  href: string;
};

export function FeaturesShowcase() {
  const t = useTranslations("home");
  const [activeTab, setActiveTab] = useState<"overview" | "researchers" | "institutions" | "industry">("overview");

  const features: Feature[] = [
    {
      key: "projects",
      title: t("moduleProjectsTitle"),
      desc: t("moduleProjectsDesc"),
      icon: <Layers className="h-6 w-6" />,
      benefits: ["Real-time collaboration", "Milestone tracking", "Gantt visualization", "Document management"],
      href: "/projects"
    },
    {
      key: "funding",
      title: t("moduleFundingTitle"),
      desc: t("moduleFundingDesc"),
      icon: <Landmark className="h-6 w-6" />,
      benefits: ["Funding call discovery", "Application management", "Review workflow", "Disbursement tracking"],
      href: "/funding"
    },
    {
      key: "proposals",
      title: t("moduleProposalsTitle"),
      desc: t("moduleProposalsDesc"),
      icon: <FileText className="h-6 w-6" />,
      benefits: ["AI-assisted evaluation", "Role-based reviews", "Approval workflows", "Version control"],
      href: "/proposals"
    },
    {
      key: "ai",
      title: t("moduleAiTitle"),
      desc: t("moduleAiDesc"),
      icon: <Sparkles className="h-6 w-6" />,
      benefits: ["Partner matching", "Grant recommendations", "Risk detection", "Smart insights"],
      href: "/ai"
    },
  ];

  const tabs = [
    { id: "overview" as const, label: "All Features" },
    { id: "researchers" as const, label: "For Researchers" },
    { id: "institutions" as const, label: "For Institutions" },
    { id: "industry" as const, label: "For Industry" },
  ];

  const filteredFeatures = activeTab === "overview" 
    ? features 
    : features.filter(f => {
        if (activeTab === "researchers") return ["projects", "proposals", "ai"].includes(f.key);
        if (activeTab === "institutions") return ["projects", "funding", "proposals"].includes(f.key);
        if (activeTab === "industry") return ["funding", "ai"].includes(f.key);
        return true;
      });

  return (
    <section id="features" className="py-24 bg-white dark:bg-gray-950">
      <div className="mx-auto max-w-(--breakpoint-xl) px-5">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="eyebrow mb-4 animate-fade-in text-brand-700 dark:text-brand-400">Powerful Features</div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-gray-900 dark:text-white animate-fade-in animation-delay-100">
            Everything You Need To Collaborate And Innovate
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed animate-fade-in animation-delay-200">
            Streamline your research workflow with AI-powered tools designed for KSA's academic and industrial ecosystem
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 hover-lift ${
                activeTab === tab.id
                  ? "bg-brand text-white shadow-lg glow-brand scale-105"
                  : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-brand hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 mb-12">
          {filteredFeatures.map((feature, index) => (
            <Card
              key={feature.key}
              className="hover-lift glass-strong particle-bg group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 p-3 text-white group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">{feature.desc}</p>
                  </div>
                </div>

                <ul className="space-y-2 mb-6">
                  {feature.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <CheckCircle2 className="h-4 w-4 text-brand-600 dark:text-brand-400 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>

                <Button href={feature.href} intent="secondary" size="sm" className="w-full group">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button href="/auth/register" size="xl">
            Start Your Free Trial
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            No credit card required • 14-day free trial • Full access
          </p>
        </div>
      </div>
    </section>
  );
}

