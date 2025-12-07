"use client";

import { useState } from "react";
import { EnterpriseCard, EnterpriseCardHeader, EnterpriseCardTitle, EnterpriseCardContent } from "components/Card";
import { 
  CreditCard, 
  Wallet,
  FileText,
  RefreshCw,
  Shield,
  TrendingUp,
  Settings,
  ArrowRight,
  Coins,
  Receipt,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const paymentFeatures = [
  {
    id: "transactions",
    title: "Transactions",
    description: "View and manage all payment transactions",
    icon: CreditCard,
    href: "/payments/transactions",
    color: "from-blue-500 to-cyan-500",
    bgColor: "from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20",
    stats: "Secure Payments"
  },
  {
    id: "wallet",
    title: "Digital Wallet",
    description: "Manage your digital wallet balance and top-up",
    icon: Wallet,
    href: "/payments/wallet",
    color: "from-emerald-500 to-teal-500",
    bgColor: "from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20",
    stats: "SAR Balance"
  },
  {
    id: "invoices",
    title: "Invoices",
    description: "View and pay invoices, track billing history",
    icon: FileText,
    href: "/payments/invoices",
    color: "from-purple-500 to-pink-500",
    bgColor: "from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20",
    stats: "Billing & Invoicing"
  },
  {
    id: "refunds",
    title: "Refunds & Disputes",
    description: "Request refunds and manage payment disputes",
    icon: RefreshCw,
    href: "/payments/refunds",
    color: "from-orange-500 to-red-500",
    bgColor: "from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20",
    stats: "Dispute Resolution"
  },
  {
    id: "gateways",
    title: "Payment Gateways",
    description: "STC Pay, Mada, PayTabs, Visa, Mastercard support",
    icon: Shield,
    href: "/payments/gateways",
    color: "from-indigo-500 to-blue-500",
    bgColor: "from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20",
    stats: "Multi-Gateway"
  },
  {
    id: "admin",
    title: "Admin Dashboard",
    description: "Financial oversight, compliance, and monitoring",
    icon: Settings,
    href: "/payments/admin",
    color: "from-amber-500 to-yellow-500",
    bgColor: "from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20",
    stats: "Admin Only"
  }
];

export function PaymentHub() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600">
            <Coins className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Payment Gateway
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
              Secure payment processing with KSA-compliant gateways
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <EnterpriseCard variant="gradient" className="text-center">
          <EnterpriseCardContent className="py-4">
            <CreditCard className="h-6 w-6 text-brand-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">00</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Transactions</div>
          </EnterpriseCardContent>
        </EnterpriseCard>
        <EnterpriseCard variant="gradient" className="text-center">
          <EnterpriseCardContent className="py-4">
            <Wallet className="h-6 w-6 text-brand-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">0.00</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Wallet Balance (SAR)</div>
          </EnterpriseCardContent>
        </EnterpriseCard>
        <EnterpriseCard variant="gradient" className="text-center">
          <EnterpriseCardContent className="py-4">
            <Receipt className="h-6 w-6 text-brand-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">00</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Pending Invoices</div>
          </EnterpriseCardContent>
        </EnterpriseCard>
        <EnterpriseCard variant="gradient" className="text-center">
          <EnterpriseCardContent className="py-4">
            <AlertCircle className="h-6 w-6 text-brand-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">00</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Active Disputes</div>
          </EnterpriseCardContent>
        </EnterpriseCard>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paymentFeatures.map((feature, index) => {
          const Icon = feature.icon;
          const isHovered = hoveredCard === feature.id;
          
          return (
            <Link key={feature.id} href={feature.href}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onMouseEnter={() => setHoveredCard(feature.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <EnterpriseCard
                  variant="default"
                  hover
                  glow
                  className={`h-full bg-gradient-to-br ${feature.bgColor} border-2 transition-all duration-300 ${
                    isHovered ? "border-brand-500 shadow-xl scale-105" : "border-transparent"
                  }`}
                >
                  <EnterpriseCardContent className="p-6">
                    {/* Icon */}
                    <motion.div
                      animate={isHovered ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}
                    >
                      <Icon className="h-8 w-8 text-white" />
                    </motion.div>

                    {/* Title */}
                    <EnterpriseCardTitle className="text-xl mb-2">
                      {feature.title}
                    </EnterpriseCardTitle>

                    {/* Description */}
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {feature.description}
                    </p>

                    {/* Stats Badge */}
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xs font-medium text-brand-600 dark:text-brand-400 bg-brand-100 dark:bg-brand-900/30 px-3 py-1 rounded-full">
                        {feature.stats}
                      </span>
                      <motion.div
                        animate={isHovered ? { x: 5 } : { x: 0 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <ArrowRight className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                      </motion.div>
                    </div>
                  </EnterpriseCardContent>
                </EnterpriseCard>
              </motion.div>
            </Link>
          );
        })}
      </div>

      {/* Compliance Notice */}
      <div className="mt-8">
        <EnterpriseCard variant="glass" className="border-2 border-emerald-500/30">
          <EnterpriseCardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-emerald-500/10">
                <Shield className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  KSA Compliance & Security
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Payment gateway is designed with compliance-by-design principles, ready for activation when needed.
                  All payment data is encrypted and stored in KSA-approved infrastructure.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                    PCI-DSS Compliant
                  </span>
                  <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                    SAMA Ready
                  </span>
                  <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                    PDPL Compliant
                  </span>
                  <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                    ISO 27001
                  </span>
                </div>
              </div>
            </div>
          </EnterpriseCardContent>
        </EnterpriseCard>
      </div>
    </div>
  );
}

