import { cva, type VariantProps } from "class-variance-authority"
import Link from "next/link"
import { twMerge } from "tailwind-merge"

const button = cva(
  [
    "justify-center",
    "inline-flex",
    "items-center",
    "rounded-xl",
    "text-center",
    "border",
    "border-brand",
    "transition-all",
    "duration-300",
    "cursor-pointer",
    "relative",
    "overflow-hidden",
    "font-medium",
    "group",
  ],
  {
    variants: {
      intent: {
        primary: [
          "bg-brand", 
          "text-white", 
          "hover:enabled:bg-brand-700",
          "hover:enabled:shadow-lg",
          "hover:enabled:scale-[1.02]",
          "hover:enabled:glow-brand",
          "active:scale-[0.98]",
        ],
        secondary: [
          "bg-transparent", 
          "text-brand", 
          "hover:enabled:bg-brand-700", 
          "hover:enabled:text-white",
          "hover:enabled:shadow-md",
          "hover:enabled:scale-[1.02]",
          "active:scale-[0.98]",
        ],
      },
      size: {
        sm: ["min-w-20", "h-full", "min-h-10", "text-sm", "py-1.5", "px-4"],
        lg: ["min-w-32", "h-full", "min-h-12", "text-lg", "py-2.5", "px-6"],
        xl: ["min-w-40", "h-full", "min-h-14", "text-xl", "py-3", "px-7"],
      },
      underline: { true: ["underline"], false: [] },
    },
    defaultVariants: {
      intent: "primary",
      size: "lg",
    },
  }
)

export interface ButtonProps extends VariantProps<typeof button> {
  underline?: boolean
  href?: string
  onClick?: () => void
  disabled?: boolean
  type?: "button" | "submit" | "reset"
  title?: string
  className?: string
  children?: React.ReactNode
}

export function Button({ className, intent, size, underline, href, onClick, disabled, type, title, children, ...props }: ButtonProps) {
  const buttonClasses = twMerge(button({ intent, size, className, underline }), disabled && "opacity-50 cursor-not-allowed");

  const buttonContent = (
    <>
      {/* Shimmer effect on hover */}
      <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out">
        <span className="h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </span>
      {/* Content */}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={buttonClasses} title={title} {...(props as any)}>
        {buttonContent}
      </Link>
    );
  }

  return (
    <button
      type={type || "button"}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      title={title}
      {...(props as any)}
    >
      {buttonContent}
    </button>
  );
}
