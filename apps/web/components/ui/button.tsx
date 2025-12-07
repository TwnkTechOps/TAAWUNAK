"use client";

import clsx from "clsx";
import {ButtonHTMLAttributes, forwardRef} from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md";
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  {className, variant = "primary", size = "md", ...props},
  ref
) {
  const base =
    "inline-flex items-center justify-center rounded-md font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2";
  const sizes = {
    sm: "h-8 px-3 text-sm",
    md: "h-9 px-4 text-sm"
  }[size];
  const variants = {
    primary:
      "bg-brand text-white hover:bg-brand-dark focus:ring-brand",
    secondary:
      "border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 focus:ring-gray-300",
    ghost: "text-gray-700 hover:bg-gray-100"
  }[variant];
  return <button ref={ref} className={clsx(base, sizes, variants, className)} {...props} />;
});

