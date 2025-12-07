"use client";

import React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { EnterpriseCard } from "./EnterpriseCard";

interface EnterpriseKpiCardProps {
  label: string;
  value: string | number;
  delta?: string;
  icon?: LucideIcon | React.ReactNode;
  trend?: "up" | "down" | "neutral";
  variant?: "default" | "gradient" | "accent" | "success" | "warning" | "danger" | "info";
  href?: string;
  onClick?: () => void;
  className?: string;
  iconColor?: string;
  valueColor?: string;
}

export function EnterpriseKpiCard({
  label,
  value,
  delta,
  icon: Icon,
  trend = "neutral",
  variant = "default",
  href,
  onClick,
  className,
  iconColor,
  valueColor
}: EnterpriseKpiCardProps) {
  const trendColors = {
    up: "text-emerald-600 dark:text-emerald-400",
    down: "text-red-600 dark:text-red-400",
    neutral: "text-gray-600 dark:text-gray-400"
  };

  const variantStyles = {
    default: "",
    gradient: "bg-gradient-to-br from-brand-50 to-emerald-50 dark:from-brand-950/30 dark:to-emerald-950/30",
    accent: "bg-gradient-to-br from-brand-500 to-brand-600 text-white",
    success: "bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200 dark:border-emerald-800",
    warning: "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800",
    danger: "bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border-red-200 dark:border-red-800",
    info: "bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-blue-200 dark:border-blue-800"
  };

  // Render icon helper - handles both component functions and React nodes
  const renderIcon = () => {
    if (!Icon) return null;
    
    // Check if it's already a React element (rendered JSX)
    if (React.isValidElement(Icon)) {
      return Icon;
    }
    
    // If it's a function or has render method, it's a component - render it
    if (typeof Icon === "function" || (typeof Icon === "object" && Icon !== null && ("render" in Icon || "$$typeof" in Icon))) {
      const Component = Icon as any;
      return (
        <Component className={twMerge(
          "h-5 w-5",
          variant === "accent" ? "text-white" : "text-brand-600 dark:text-brand-400"
        )} />
      );
    }
    
    // Otherwise, it's a primitive React node
    return Icon as React.ReactNode;
  };

  const content = (
    <EnterpriseCard
      variant={variant === "accent" ? "gradient" : variant}
      hover={!!(href || onClick)}
      glow={variant === "accent"}
      className={twMerge(
        variantStyles[variant],
        variant === "accent" && "border-0",
        (variant === "success" || variant === "warning" || variant === "danger" || variant === "info") && "border-2",
        className
      )}
      onClick={onClick}
    >
      <div className="p-6">
        {/* Header with icon */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className={twMerge(
              "text-sm font-medium uppercase tracking-wider",
              variant === "accent" ? "text-white/80" : "text-gray-600 dark:text-gray-400"
            )}>
              {label}
            </p>
          </div>
          {Icon && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              className={twMerge(
                "p-3 rounded-xl",
                variant === "accent" 
                  ? "bg-white/20 backdrop-blur-sm" 
                  : "bg-brand-500/10 dark:bg-brand-400/10",
                iconColor || ""
              )}
            >
              {renderIcon()}
            </motion.div>
          )}
        </div>

        {/* Value */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className={twMerge(
            "text-3xl font-bold mb-2",
            variant === "accent" ? "text-white" : valueColor || "text-gray-900 dark:text-white"
          )}>
            {value}
          </h3>
        </motion.div>

        {/* Delta/Trend */}
        {delta && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-1"
          >
            {trend === "up" && (
              <motion.svg
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="h-4 w-4 text-emerald-600 dark:text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </motion.svg>
            )}
            {trend === "down" && (
              <motion.svg
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="h-4 w-4 text-red-600 dark:text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17l5-5m0 0l-5-5m5 5H6" />
              </motion.svg>
            )}
            <span className={twMerge(
              "text-sm font-medium",
              variant === "accent" ? "text-white/90" : trendColors[trend]
            )}>
              {delta}
            </span>
          </motion.div>
        )}
      </div>
    </EnterpriseCard>
  );

  if (href) {
    return (
      <a href={href} className="block">
        {content}
      </a>
    );
  }

  return content;
}

