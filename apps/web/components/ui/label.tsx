"use client";

import clsx from "clsx";
import {LabelHTMLAttributes} from "react";

export function Label({className, ...props}: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={clsx("mb-1 block text-sm font-medium text-gray-700", className)} {...props} />;
}

