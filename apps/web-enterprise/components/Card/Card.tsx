import { type HTMLAttributes } from "react"
import { twMerge } from "tailwind-merge"

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={twMerge(
        "rounded-xl border bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900",
        "card-2025 hover-lift transition-all duration-300",
        "group relative overflow-hidden",
        className
      )} 
      {...props}
    >
      {/* Subtle shimmer effect on hover */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out">
        <div className="h-full w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>
      <div className="relative z-10">{props.children}</div>
    </div>
  )
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={twMerge("px-5 pt-5 relative z-10", className)} {...props} />
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 
      className={twMerge(
        "text-base font-semibold text-gray-900 dark:text-white",
        "bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text",
        className
      )} 
      {...props} 
    />
  )
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={twMerge("px-5 pb-5 relative z-10", className)} {...props} />
}

