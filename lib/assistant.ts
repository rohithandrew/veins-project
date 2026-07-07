import type { Material, PurchaseOrder, StockRequest, SupplyRequest, Supplier, DashboardWidgetKey } from "./types";

interface AssistantState {
  materials: Material[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  stockRequests: StockRequest[];
  supplyRequests: SupplyRequest[];
}

export interface AssistantReply {
  text: string;
  addWidget?: DashboardWidgetKey;
  removeWidget?: DashboardWidgetKey;
  delayMs: number;
}

interface WidgetIntent {
  key: DashboardWidgetKey;
  label: string;
  matches: (q: string) => boolean;
  addDelayMs: number;
  addText: string;
}

const WIDGET_INTENTS: WidgetIntent[] = [
  {
    key: "supplier-insights",
    label: "Supplier Insights",
    matches: (q) => q.includes("supplier") && (q.includes("insight") || q.includes("dashboard") || q.includes("widget") || q.includes("panel")),
    addDelayMs: 20000,
    addText: "Sure — pulling supplier performance data and generating a Supplier Insights panel for your Dashboard now.",
  },
  {
    key: "delivery-timeline",
    label: "Delivery Timeline",
    matches: (q) => q.includes("timeline") || q.includes("delivery date") || (q.includes("delivery") && (q.includes("dashboard") || q.includes("widget") || q.includes("panel"))),
    addDelayMs: 18000,
    addText: "On it — building a Delivery Timeline panel so you can see upcoming PO deadlines at a glance.",
  },
  {
    key: "pending-requests",
    label: "Pending Stock Requests",
    matches: (q) => q.includes("pending request") && (q.includes("dashboard") || q.includes("widget") || q.includes("panel") || q.includes("add")),
    addDelayMs: 16000,
    addText: "Sure — adding a Pending Stock Requests panel to your Dashboard.",
  },
  {
    key: "po-status-breakdown",
    label: "PO Status Breakdown",
    matches: (q) => q.includes("status breakdown") || q.includes("po status") || q.includes("order status") || (q.includes("status") && q.includes("chart")),
    addDelayMs: 19000,
    addText: "Generating a PO Status Breakdown panel for your Dashboard now.",
  },
  {
    key: "critical-materials",
    label: "Critical Materials",
    matches: (q) => q.includes("critical material"),
    addDelayMs: 17000,
    addText: "Flagging critically low materials — adding a Critical Materials panel to your Dashboard.",
  },
];

function listLowStock(materials: Material[]) {
  return materials.filter((m) => m.currentStock <= m.reorderPoint);
}

export function generateReply(rawQuery: string, state: AssistantState): AssistantReply {
  const q = rawQuery.trim().toLowerCase();

  if (!q) {
    return {
      text: "Ask me something like \"which materials are low on stock\", \"status of PO-002\", or \"add supplier dashboard insight to the main dashboard\".",
      delayMs: 900,
    };
  }

  const isRemove = /\b(remove|delete|hide|dismiss)\b/.test(q);
  for (const intent of WIDGET_INTENTS) {
    if (!intent.matches(q)) continue;
    if (isRemove) {
      return {
        text: `Done — removed the ${intent.label} panel from your Dashboard.`,
        removeWidget: intent.key,
        delayMs: 900,
      };
    }
    return { text: intent.addText, addWidget: intent.key, delayMs: intent.addDelayMs };
  }

  if (q.includes("low stock") || q.includes("reorder") || q.includes("running out") || q.includes("at risk")) {
    const low = listLowStock(state.materials);
    if (low.length === 0) {
      return { text: "All materials are currently above their reorder point — nothing needs attention right now.", delayMs: 1100 };
    }
    const lines = low.map((m) => `• ${m.name}: ${m.currentStock} ${m.unit} (reorder point ${m.reorderPoint} ${m.unit})`);
    return {
      text: `${low.length} material(s) are at or below their reorder point:\n${lines.join("\n")}\n\nYou'll see a "Request Supply" button for these on every page while stock stays low.`,
      delayMs: 1500,
    };
  }

  if (q.includes("pending request") || (q.includes("request") && (q.includes("stock") || q.includes("how many")))) {
    const pending = state.stockRequests.filter((r) => r.status === "pending");
    if (pending.length === 0) {
      return { text: "There are no stock requests awaiting action right now.", delayMs: 1100 };
    }
    const lines = pending.map((r) => `• ${r.id} — ${r.materialName} ×${r.qtyRequested} for ${r.poNumber}`);
    return { text: `${pending.length} request(s) awaiting action:\n${lines.join("\n")}`, delayMs: 1400 };
  }

  const poMatch = rawQuery.toUpperCase().match(/PO-\d{3}/);
  if (poMatch) {
    const po = state.purchaseOrders.find((p) => p.poNumber === poMatch[0]);
    if (po) {
      const statusLabel = { draft: "Draft", pending: "Ready for Production", in_progress: "In Progress", completed: "Completed" }[po.status];
      return {
        text: `${po.poNumber} (${po.clientName}) is currently "${statusLabel}". ${po.kits.length} kit(s), delivery due ${po.deliveryDate}.`,
        delayMs: 1200,
      };
    }
    return { text: `I couldn't find ${poMatch[0]} in the system. Known POs: ${state.purchaseOrders.map((p) => p.poNumber).join(", ")}.`, delayMs: 1000 };
  }

  const supplierMatch = state.suppliers.find((s) => q.includes(s.companyName.toLowerCase()));
  if (supplierMatch) {
    return {
      text: `${supplierMatch.companyName} — contact ${supplierMatch.contactPerson}, ${supplierMatch.phone}, ${supplierMatch.email}. Reliability rating ${supplierMatch.rating.toFixed(1)}/5, avg response time ${supplierMatch.avgResponseTimeHours}h.`,
      delayMs: 1200,
    };
  }

  if (q.includes("supplier")) {
    const totalOpen = state.supplyRequests.filter((s) => s.status === "requested").length;
    return {
      text: `You have ${state.suppliers.length} suppliers on file and ${totalOpen} supply request(s) currently pending with them. Try asking about a supplier by name, or say "add supplier dashboard insight to the main dashboard".`,
      delayMs: 1300,
    };
  }

  if (q.includes("help") || q.includes("what can you")) {
    return {
      text: "I can answer questions about stock levels, purchase order status, and suppliers. I can also customize this app — try: \"add supplier dashboard insight\", \"add delivery timeline to dashboard\", \"add pending requests widget\", \"add PO status breakdown\", or \"add critical materials panel\".",
      delayMs: 1000,
    };
  }

  return {
    text: "I'm not sure about that yet, but I can help with stock levels, PO status, supplier details, or adding insight widgets to your Dashboard. Try rephrasing, or ask \"help\" for examples.",
    delayMs: 1200,
  };
}
