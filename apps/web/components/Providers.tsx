"use client";

import {Toaster} from "sonner";
import {ReactNode} from "react";

export function Providers({children}: {children: ReactNode}) {
  return (
    <>
      {children}
      <Toaster richColors position="top-right" />
    </>
  );
}

