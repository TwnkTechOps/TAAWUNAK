"use client";

import { motion } from "framer-motion";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { EnterpriseCard, EnterpriseCardContent, EnterpriseCardHeader, EnterpriseCardTitle } from "./EnterpriseCard";

interface EnterpriseStatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: "increase" | "decrease" | "neutral";
    period?: string;
  };
  icon?: LucideIcon;
  iconColor?: string;
  description?: string;
  footer?: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}

const variantConfig = {
  default: {
    iconBg: "bg-brand-500/10 dark:bg-brand-400/10",
    iconColor: "text-brand-600 dark:text-brand-400",
    border: "border-brand-200 dark:border-brand-800"
  },
  success: {
    iconBg: "bg-emerald-500/10 dark:bg-emerald-400/10",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800"
  },
  warning: {
    iconBg: "bg-amber-500/10 dark:bg-amber-400/10",
    iconColor: "text-amber-600 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-800"
  },
  danger: {
    iconBg: "bg-red-500/10 dark:bg-red-400/10",
    iconColor: "text-red-600 dark:text-red-400",
    border: "border-red-200 dark:border-red-800"
  },
  info: {
    iconBg: "bg-blue-500/10 dark:bg-blue-400/10",
    iconColor: "text-blue-600 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800"
  }
};

export function EnterpriseStatCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor,
  description,
  footer,
  variant = "default",
  className
}: EnterpriseStatCardProps) {
  const config = variantConfig[variant];

  const getTrendIcon = () => {
    if (!change) return null;
    if (change.type === "increase") return TrendingUp;
    if (change.type === "decrease") return TrendingDown;
    return Minus;
  };

  const TrendIcon = change ? getTrendIcon() : null;

  return (
    <EnterpriseCard
      variant="default"
      hover
      className={twMerge("border-2", config.border, className)}
    >
      <EnterpriseCardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <EnterpriseCardTitle className="text-base">{title}</EnterpriseCardTitle>
            {description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
            )}
          </div>
          {Icon && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              className={twMerge(
                "p-2.5 rounded-xl",
                config.iconBg,
                iconColor || config.iconColor
              )}
            >
              <Icon className={twMerge("h-5 w-5", iconColor || config.iconColor)} />
            </motion.div>
          )}
        </div>
      </EnterpriseCardHeader>

      <EnterpriseCardContent>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-baseline gap-2 mb-3">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
              {value}
            </h3>
          </div>

          {change && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className={twMerge(
                "flex items-center gap-1.5 text-sm font-medium",
                change.type === "increase" && "text-emerald-600 dark:text-emerald-400",
                change.type === "decrease" && "text-red-600 dark:text-red-400",
                change.type === "neutral" && "text-gray-600 dark:text-gray-400"
              )}
            >
              {TrendIcon && (
                <TrendIcon className="h-4 w-4" />
              )}
              <span>
                {change.type === "increase" && "+"}
                {change.value}%
              </span>
              {change.period && (
                <span className="text-gray-500 dark:text-gray-400">
                  {change.period}
                </span>
              )}
            </motion.div>
          )}
        </motion.div>

        {footer && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
            {footer}
          </div>
        )}
      </EnterpriseCardContent>
    </EnterpriseCard>
  );
}

