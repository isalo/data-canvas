"use client";

import { EntityScreen } from "@datacanvas/react";
import { Country } from "@/lib/entities";

export default function CountriesPage() {
  return <EntityScreen entity={Country} />;
}
