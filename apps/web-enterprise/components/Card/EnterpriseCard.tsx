"use client";

import { type HTMLAttributes, ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { motion } from "framer-motion";

interface EnterpriseCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "gradient" | "glass" | "elevated" | "bordered";
  hover?: boolean;
  glow?: boolean;
  icon?: ReactNode;
  badge?: ReactNode;
}

const variantStyles = {
  default: "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800",
  gradient: "bg-gradient-to-br from-brand-50 to-brand-100/50 dark:from-brand-950/30 dark:to-brand-900/50 border border-brand-200/50 dark:border-brand-800/50",
  glass: "bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 dark:border-gray-800/50 shadow-xl",
  elevated: "bg-white dark:bg-gray-900 border-0 shadow-2xl",
  bordered: "bg-white dark:bg-gray-900 border-2 border-brand-200 dark:border-brand-800"
};

export function EnterpriseCard({ 
  className, 
  variant = "default",
  hover = true,
  glow = false,
  icon,
  badge,
  children,
  ...props 
}: EnterpriseCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hover ? { y: -4, scale: 1.01 } : {}}
      className={twMerge(
        "relative rounded-2xl overflow-hidden",
        variantStyles[variant],
        hover && "transition-all duration-300 cursor-pointer",
        glow && "shadow-lg shadow-brand-500/20",
        className
      )}
      {...props}
    >
      {/* Animated gradient overlay on hover */}
      {hover && (
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 via-transparent to-brand-600/5" />
        </motion.div>
      )}

      {/* Shimmer effect */}
      {hover && (
        <motion.div
          className="absolute inset-0 -translate-x-full group-hover:translate-x-full pointer-events-none"
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <div className="h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </motion.div>
      )}

      {/* Icon badge */}
      {icon && (
        <div className="absolute top-4 right-4 z-20">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="p-2 rounded-xl bg-brand-500/10 dark:bg-brand-400/10"
          >
            {icon}
          </motion.div>
        </div>
      )}

      {/* Badge */}
      {badge && (
        <div className="absolute top-4 left-4 z-20">
          {badge}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>

      {/* Glow effect */}
      {glow && (
        <motion.div
          className="absolute -inset-0.5 bg-gradient-to-r from-brand-500 via-brand-600 to-brand-500 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl"
          animate={{ opacity: [0, 0.2, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}

export function EnterpriseCardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={twMerge("px-6 pt-6 pb-4", className)} {...props} />
  );
}

export function EnterpriseCardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 
      className={twMerge(
        "text-lg font-bold text-gray-900 dark:text-white",
        "bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent",
        className
      )} 
      {...props} 
    />
  );
}

export function EnterpriseCardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={twMerge("text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed", className)} {...props} />
  );
}

export function EnterpriseCardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={twMerge("px-6 pb-6", className)} {...props} />
  );
}

export function EnterpriseCardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={twMerge("px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50", className)} {...props} />
  );
}

