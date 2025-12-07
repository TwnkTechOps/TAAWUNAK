"use client";

import clsx from "clsx";
import {HTMLAttributes} from "react";

export function Card({className, ...props}: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("rounded-xl border bg-white shadow-sm", className)} {...props} />;
}

export function CardHeader({className, ...props}: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("p-4 pb-0", className)} {...props} />;
}

export function CardTitle({className, ...props}: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={clsx("text-lg font-medium", className)} {...props} />;
}

export function CardContent({className, ...props}: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("p-4", className)} {...props} />;
}

