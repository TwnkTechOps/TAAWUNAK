"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import clsx from "clsx";
import {X} from "lucide-react";
import {ReactNode} from "react";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({children, className}: {children: ReactNode; className?: string}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 bg-black/30" />
      <DialogPrimitive.Content
        className={clsx(
          "fixed left-1/2 top-1/2 w-[95vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-white p-4 shadow-lg",
          className
        )}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-2 top-2 rounded p-1 text-gray-600 hover:bg-gray-100">
          <X size={16} />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DialogHeader({children}: {children: ReactNode}) {
  return <div className="mb-2 text-lg font-semibold">{children}</div>;
}

export function DialogDescription({children}: {children: ReactNode}) {
  return <div className="mb-3 text-sm text-gray-600">{children}</div>;
}

