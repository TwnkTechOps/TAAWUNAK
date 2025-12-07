"use client";

import clsx from "clsx";
import {HTMLAttributes} from "react";

export function Badge({className, ...props}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium",
        "bg-gray-100 text-gray-800",
        className
      )}
      {...props}
    />
  );
}

