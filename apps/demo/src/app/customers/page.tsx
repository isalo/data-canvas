"use client";

import { EntityScreen } from "@data-canvas/react";
import { Customer } from "@/lib/entities";

export default function CustomersPage() {
  return <EntityScreen entity={Customer} />;
}
