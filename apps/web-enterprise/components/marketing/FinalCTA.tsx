"use client";

import { Button } from "components/Button/Button";
import { EnterpriseCard } from "components/Card";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  "14-day free trial",
  "No credit card required",
  "Full feature access",
  "Dedicated onboarding support"
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

export function FinalCTA() {
  return (
    <section className="py-32 bg-gradient-to-b from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-mask opacity-5" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-500/5 to-transparent animate-shimmer" />
      
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="relative mx-auto max-w-5xl px-5 z-10"
      >
        <EnterpriseCard
          variant="glass"
          hover={false}
          glow
          className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-2 border-gray-200/50 dark:border-gray-700/50 shadow-2xl"
        >
          <div className="p-12 md:p-16 text-center">
            {/* Icon Badge */}
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 mb-6 shadow-lg"
            >
              <Sparkles className="h-8 w-8 text-white" />
            </motion.div>

            {/* Headline */}
            <motion.h2
              variants={itemVariants}
              className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white leading-tight"
            >
              Ready To Transform Your Research Workflow?
            </motion.h2>

            {/* Sub-headline */}
            <motion.p
              variants={itemVariants}
              className="text-xl sm:text-2xl text-gray-700 dark:text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed font-normal"
            >
              Join hundreds of researchers, institutions, and industry partners already using{" "}
              <span className="font-semibold text-gray-900 dark:text-white">TAWĀWUNAK</span>
            </motion.p>

            {/* Feature Badges */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center justify-center gap-3 mb-10"
            >
              {features.slice(0, 2).map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 bg-gradient-to-r from-brand-50 to-emerald-50 dark:from-brand-950/30 dark:to-emerald-950/30 backdrop-blur-sm rounded-full px-6 py-3.5 text-sm font-semibold text-gray-900 dark:text-white border-2 border-brand-200/50 dark:border-brand-800/50 shadow-lg hover:shadow-xl transition-all"
                >
                  <CheckCircle2 className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                  <span>{feature}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center justify-center gap-4 mb-8"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  href="/auth/register"
                  size="xl"
                  className="bg-gradient-to-r from-brand-600 to-brand-700 text-white hover:from-brand-700 hover:to-brand-800 shadow-2xl font-bold text-lg px-8 py-4 border-0"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  href="/auth/login"
                  size="xl"
                  intent="secondary"
                  className="border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold text-lg px-8 py-4"
                >
                  Sign In
                </Button>
              </motion.div>
            </motion.div>

            {/* Footer Link */}
            <motion.p
              variants={itemVariants}
              className="text-base text-gray-600 dark:text-gray-400 font-medium"
            >
              Questions?{" "}
              <a
                href="/contact"
                className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 underline font-semibold transition-colors"
              >
                Contact our team
              </a>
            </motion.p>
          </div>
        </EnterpriseCard>
      </motion.div>
    </section>
  );
}

