"use client";

import { type EntityRow } from "@datacanvas/core";
import { EntityScreen } from "@datacanvas/react";
import { useState } from "react";
import { Order, OrderItem } from "@/lib/entities";

/**
 * Master/detail example: clicking an order shows a second EntityScreen for
 * its items, filtered by orderId and with orderId pre-filled on create.
 */
export default function OrdersPage() {
  const [selected, setSelected] = useState<EntityRow | null>(null);

  return (
    <div className="stack">
      <EntityScreen
        entity={Order}
        onRowClick={setSelected}
        selectedId={selected ? String(selected.id) : null}
      />

      {selected ? (
        <EntityScreen
          entity={OrderItem}
          title={`Items — ${String(selected.reference)}`}
          filter={{ orderId: selected.id }}
          initialValues={{ orderId: selected.id }}
          pageSize={5}
        />
      ) : (
        <p className="hint">Select an order above to view and edit its items.</p>
      )}
    </div>
  );
}
