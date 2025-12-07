"use client";

import clsx from "clsx";
import {HTMLAttributes} from "react";

export function Table({className, ...props}: HTMLAttributes<HTMLTableElement>) {
  return <table className={clsx("min-w-full divide-y text-sm", className)} {...props} />;
}

export function THead({className, ...props}: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={clsx("bg-gray-50", className)} {...props} />;
}

export function TBody({className, ...props}: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={clsx("divide-y", className)} {...props} />;
}

export function TH({className, ...props}: HTMLAttributes<HTMLTableCellElement>) {
  return <th className={clsx("px-4 py-2 text-left font-medium text-gray-600", className)} {...props} />;
}

export function TD({className, ...props}: HTMLAttributes<HTMLTableCellElement>) {
  return <td className={clsx("px-4 py-2", className)} {...props} />;
}

