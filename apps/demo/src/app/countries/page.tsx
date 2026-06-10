"use client";

import { EntityScreen } from "@data-canvas/react";
import { Country } from "@/lib/entities";

export default function CountriesPage() {
  return <EntityScreen entity={Country} />;
}
