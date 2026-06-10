"use client";

import { DataCanvasProvider } from "@data-canvas/react";
import { type ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return <DataCanvasProvider baseUrl="/api/datacanvas">{children}</DataCanvasProvider>;
}
