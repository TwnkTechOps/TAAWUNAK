"use client";

import { Card, CardContent } from "components/Card/Card";
import { Star, Quote } from "lucide-react";
import { PartnersMarquee } from "components/ui/partners-marquee";

const testimonials = [
  {
    quote: "User responses will go here",
    author: "Name",
    role: "Title, Institution",
    rating: 0,
    avatar: "00"
  },
  {
    quote: "User responses will go here",
    author: "Name",
    role: "Title, Institution",
    rating: 0,
    avatar: "00"
  },
  {
    quote: "User responses will go here",
    author: "Name",
    role: "Title, Institution",
    rating: 0,
    avatar: "00"
  }
];

const stats = [
  { value: "00", label: "Active Projects", icon: "📊" },
  { value: "00", label: "Researchers", icon: "👥" },
  { value: "SAR 00M", label: "Funding Managed", icon: "📈" },
  { value: "00%", label: "Satisfaction Rate", icon: "⭐" }
];

export function SocialProofSection() {
  return (
    <section id="testimonials" className="py-24 bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-(--breakpoint-xl) px-5">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <Card
              key={stat.label}
              className="hover-lift glass-strong text-center particle-bg"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
              <div className="text-5xl mb-4">{stat.icon}</div>
              <div className="text-4xl font-bold text-brand-600 dark:text-brand-400 mb-2">{stat.value}</div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Testimonials */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <div className="eyebrow mb-4 text-brand-700 dark:text-brand-400">User Testimonials</div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              User Responses Will Go Here
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="hover-lift glass-strong"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <CardContent className="p-6">
                  <Quote className="h-8 w-8 text-gray-300 dark:text-gray-600 mb-4" />
                  <p className="text-gray-500 dark:text-gray-500 mb-4 italic leading-relaxed text-sm">
                    {testimonial.quote}
                  </p>
                  
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                    <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500 font-medium text-xs">
                      {testimonial.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-400 dark:text-gray-500">{testimonial.author}</div>
                      <div className="text-xs text-gray-400 dark:text-gray-600">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Partners */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 font-medium">
              Trusted by leading institutions across Saudi Arabia
            </p>
          </div>
          <PartnersMarquee />
        </div>
      </div>
    </section>
  );
}

