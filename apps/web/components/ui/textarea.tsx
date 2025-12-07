"use client";

import clsx from "clsx";
import {TextareaHTMLAttributes, forwardRef} from "react";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, Props>(function Textarea({className, ...props}, ref) {
  return (
    <textarea
      ref={ref}
      className={clsx(
        "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm",
        "placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30",
        className
      )}
      {...props}
    />
  );
});

