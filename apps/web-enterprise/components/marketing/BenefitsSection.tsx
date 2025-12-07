"use client";

import { Card, CardContent } from "components/Card/Card";
import { Clock, Shield, Zap, BarChart3, Globe, Lock, Sparkles } from "lucide-react";

const benefits = [
  {
    icon: <Zap className="h-7 w-7" />,
    title: "10x Faster Collaboration",
    description: "Reduce proposal submission time from weeks to days with AI-assisted workflows and automated processes.",
    gradient: "from-yellow-400 to-orange-500",
    bgGradient: "from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20"
  },
  {
    icon: <Shield className="h-7 w-7" />,
    title: "KSA Compliance Built-In",
    description: "Automatically ensure all projects meet Saudi Arabia's data privacy and research compliance requirements.",
    gradient: "from-emerald-500 to-teal-600",
    bgGradient: "from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20"
  },
  {
    icon: <BarChart3 className="h-7 w-7" />,
    title: "Real-Time Insights",
    description: "Track project progress, funding status, and collaboration metrics with comprehensive dashboards.",
    gradient: "from-blue-500 to-cyan-600",
    bgGradient: "from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20"
  },
  {
    icon: <Globe className="h-7 w-7" />,
    title: "Bilingual & Accessible",
    description: "Full Arabic/English support with RTL layouts and WCAG 2.1 AA accessibility compliance.",
    gradient: "from-purple-500 to-pink-600",
    bgGradient: "from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20"
  },
  {
    icon: <Lock className="h-7 w-7" />,
    title: "Enterprise Security",
    description: "End-to-end encryption, SSO integration, MFA support, and regular security audits.",
    gradient: "from-indigo-500 to-blue-600",
    bgGradient: "from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20"
  },
  {
    icon: <Clock className="h-7 w-7" />,
    title: "24/7 Support",
    description: "Dedicated support team available around the clock to help you succeed.",
    gradient: "from-rose-500 to-pink-600",
    bgGradient: "from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20"
  }
];

export function BenefitsSection() {
  return (
    <section className="py-24 bg-white dark:bg-gray-950 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-grid-mask opacity-5" />
      
      <div className="relative mx-auto max-w-(--breakpoint-xl) px-5 z-10">
        <div className="text-center mb-16">
          <div className="eyebrow mb-4 text-brand-700 dark:text-brand-400 animate-fade-in">Why Choose Us</div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-gray-900 dark:text-white animate-fade-in animation-delay-100">
            Built For Speed, Security, And Scale
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed animate-fade-in animation-delay-200">
            Experience the difference with a platform designed specifically for KSA's research ecosystem
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit, index) => (
            <Card
              key={benefit.title}
              className="hover-lift glass-strong group relative overflow-hidden border-2 border-transparent hover:border-brand-200 dark:hover:border-brand-800 transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Subtle background gradient on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${benefit.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              
              <CardContent className="p-8 relative z-10">
                {/* Icon with enhanced styling */}
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${benefit.gradient} text-white mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-xl`}>
                  {benefit.icon}
                </div>
                
                {/* Title */}
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-brand-700 dark:group-hover:text-brand-400 transition-colors">
                  {benefit.title}
                </h3>
                
                {/* Description */}
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                  {benefit.description}
                </p>
                
                {/* Decorative element */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-2 text-xs text-brand-600 dark:text-brand-400 font-medium">
                    <Sparkles className="h-3 w-3" />
                    <span>Included in all plans</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

