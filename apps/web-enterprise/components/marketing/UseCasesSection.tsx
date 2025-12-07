"use client";

import { Card, CardContent } from "components/Card/Card";
import { Microscope, Building2, Handshake, BarChart3, ArrowRight } from "lucide-react";
import { Button } from "components/Button/Button";

const useCases = [
  {
    title: "For Researchers",
    icon: <Microscope className="h-10 w-10" />,
    description: "Accelerate research with AI-powered collaboration tools and seamless workflows",
    features: [
      "Find partners across institutions",
      "Submit and track proposals",
      "Manage projects in real-time",
      "Publish papers with workflows"
    ],
    cta: "Start Researching",
    href: "/auth/register?role=researcher",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    title: "For Institutions",
    icon: <Building2 className="h-10 w-10" />,
    description: "Streamline research management and ensure full compliance with KSA regulations",
    features: [
      "Manage multiple research projects",
      "Track funding and grants",
      "Ensure KSA compliance",
      "Generate comprehensive reports"
    ],
    cta: "Manage Institution",
    href: "/auth/register?role=institution",
    gradient: "from-emerald-500 to-teal-500"
  },
  {
    title: "For Industry Partners",
    icon: <Handshake className="h-10 w-10" />,
    description: "Connect with academia and drive innovation through strategic partnerships",
    features: [
      "Discover research opportunities",
      "Apply for funding programs",
      "Collaborate on joint projects",
      "Access cutting-edge research"
    ],
    cta: "Join as Partner",
    href: "/auth/register?role=industry",
    gradient: "from-purple-500 to-pink-500"
  },
  {
    title: "For Government",
    icon: <BarChart3 className="h-10 w-10" />,
    description: "Oversee national research initiatives and manage strategic funding programs",
    features: [
      "Monitor research progress",
      "Manage funding allocations",
      "Ensure strategic alignment",
      "Generate policy insights"
    ],
    cta: "Government Portal",
    href: "/auth/register?role=government",
    gradient: "from-amber-500 to-orange-500"
  }
];

export function UseCasesSection() {
  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-(--breakpoint-xl) px-5">
        <div className="text-center mb-16">
          <div className="eyebrow mb-4 animate-fade-in text-brand-700 dark:text-brand-400">Built For Everyone</div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-gray-900 dark:text-white animate-fade-in animation-delay-100">
            Solutions Tailored To Your Role
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed animate-fade-in animation-delay-200">
            Whether you're a researcher, institution, industry partner, or government entity, we have the tools you need
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {useCases.map((useCase, index) => (
            <Card
              key={useCase.title}
              className="hover-lift glass-strong group relative overflow-hidden h-full flex flex-col"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${useCase.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              
              <CardContent className="p-6 relative z-10 flex flex-col flex-1">
                {/* Icon */}
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${useCase.gradient} text-white mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {useCase.icon}
                </div>
                
                {/* Title */}
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{useCase.title}</h3>
                
                {/* Description - Fixed height for alignment */}
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-5 min-h-[3.5rem] leading-relaxed">
                  {useCase.description}
                </p>

                {/* Features - Fixed spacing with checkmarks */}
                <ul className="space-y-2.5 mb-6 flex-1">
                  {useCase.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                      <span className="text-brand-600 dark:text-brand-400 mt-0.5 font-bold text-base">✓</span>
                      <span className="leading-relaxed flex-1">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button - Always at bottom */}
                <Button
                  href={useCase.href}
                  intent="secondary"
                  size="sm"
                  className="w-full group/btn mt-auto"
                >
                  {useCase.cta}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

