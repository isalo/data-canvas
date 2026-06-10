"use client";

import { EntityScreen } from "@datacanvas/react";
import { Customer } from "@/lib/entities";

export default function CustomersPage() {
  return <EntityScreen entity={Customer} />;
}
