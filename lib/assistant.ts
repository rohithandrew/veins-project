import type {
  Material,
  PurchaseOrder,
  StockRequest,
  SupplyRequest,
  Supplier,
  DashboardWidgetKey,
  CustomPageKey,
  CorePageKey,
  ViewKey,
} from "./types";

interface AssistantState {
  materials: Material[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  stockRequests: StockRequest[];
  supplyRequests: SupplyRequest[];
  unlockedPages: CorePageKey[];
}

export interface AssistantReply {
  text: string;
  addWidget?: DashboardWidgetKey;
  removeWidget?: DashboardWidgetKey;
  addPage?: CustomPageKey;
  removePage?: CustomPageKey;
  unlockPage?: CorePageKey;
  navigateTo?: ViewKey;
  delayMs: number;
}

const CORE_PAGE_LABELS: Record<CorePageKey, string> = {
  dashboard: "Dashboard",
  "po-upload": "PO Upload & Processing",
  production: "Production",
  inventory: "Inventory Management",
  supplier: "Supplier Dashboard",
};

interface CorePageIntent {
  key: CorePageKey;
  matches: (q: string) => boolean;
  addDelayMs: number;
  addText: string;
}

const CORE_PAGE_INTENTS: CorePageIntent[] = [
  // Order matters: "supplier" must be checked before the bare "dashboard" matcher,
  // since "add a supplier dashboard page" contains the word "dashboard" too.
  {
    key: "supplier",
    matches: (q) => q.includes("supplier") && (q.includes("dashboard") || q.includes("page")),
    addDelayMs: 16000,
    addText: "Sure — building the Supplier Dashboard with contact details and supply request tracking.",
  },
  {
    key: "po-upload",
    matches: (q) => q.includes("po upload") || q.includes("upload processing") || (q.includes("upload") && q.includes("po")) || (q.includes("purchase order") && q.includes("page")),
    addDelayMs: 18000,
    addText: "Sure — building the PO Upload & Processing page so you can parse purchase orders into kits and BOMs.",
  },
  {
    key: "production",
    matches: (q) => q.includes("production"),
    addDelayMs: 17000,
    addText: "Building the Production page now — kit breakdowns, timelines, and stock-request controls incoming.",
  },
  {
    key: "inventory",
    matches: (q) => q.includes("inventory"),
    addDelayMs: 19000,
    addText: "Generating the Inventory Management page — stock levels, raised requests, and low-stock alerts.",
  },
  {
    key: "dashboard",
    matches: (q) => q.includes("dashboard") && !q.includes("supplier"),
    addDelayMs: 20000,
    addText: "On it — assembling your KPIs, stock health, and recent activity into a live Dashboard now.",
  },
];

interface PageIntent {
  key: CustomPageKey;
  label: string;
  matches: (q: string) => boolean;
  addDelayMs: number;
  addText: string;
  requiresCorePage?: CorePageKey;
}

const PAGE_INTENTS: PageIntent[] = [
  {
    key: "low-stock",
    label: "Low Stock",
    matches: (q) => q.includes("page") && q.includes("low") && q.includes("stock"),
    addDelayMs: 20000,
    addText: "Sure — building a new page that only shows materials currently low on stock, and adding it to your sidebar now.",
    requiresCorePage: "inventory",
  },
];

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
    matches: (q) => q.includes("supplier") && (q.includes("insight") || q.includes("widget") || q.includes("panel")),
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

function needsCorePageMessage(requirement: CorePageKey, forLabel: string): string {
  return `I'll need to build the ${CORE_PAGE_LABELS[requirement]} page first — try asking me to build that before requesting the ${forLabel} page.`;
}

export function generateReply(rawQuery: string, state: AssistantState): AssistantReply {
  const q = rawQuery.trim().toLowerCase();

  if (!q) {
    return {
      text: "Tell me what to build — try \"Build me a dashboard\" to get started, or ask a question about stock, POs, or suppliers.",
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
    if (!state.unlockedPages.includes("dashboard")) {
      return { text: needsCorePageMessage("dashboard", intent.label), delayMs: 1200 };
    }
    return { text: intent.addText, addWidget: intent.key, navigateTo: "dashboard", delayMs: intent.addDelayMs };
  }

  for (const intent of PAGE_INTENTS) {
    if (!intent.matches(q)) continue;
    if (isRemove) {
      return {
        text: `Done — I've removed the ${intent.label} page from your sidebar.`,
        removePage: intent.key,
        delayMs: 900,
      };
    }
    if (intent.requiresCorePage && !state.unlockedPages.includes(intent.requiresCorePage)) {
      return { text: needsCorePageMessage(intent.requiresCorePage, intent.label), delayMs: 1200 };
    }
    return { text: intent.addText, addPage: intent.key, navigateTo: intent.key, delayMs: intent.addDelayMs };
  }

  for (const intent of CORE_PAGE_INTENTS) {
    if (!intent.matches(q)) continue;
    const label = CORE_PAGE_LABELS[intent.key];
    if (state.unlockedPages.includes(intent.key)) {
      return { text: `The ${label} page is already built — taking you there now.`, navigateTo: intent.key, delayMs: 700 };
    }
    return { text: intent.addText, unlockPage: intent.key, navigateTo: intent.key, delayMs: intent.addDelayMs };
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
      text: `You have ${state.suppliers.length} suppliers on file and ${totalOpen} supply request(s) currently pending with them. Try asking about a supplier by name, or say "build a supplier dashboard page".`,
      delayMs: 1300,
    };
  }

  if (q.includes("help") || q.includes("what can you")) {
    return {
      text: "I can build pages for you — try \"Build me a dashboard\", \"Add a PO upload page\", \"Add a production tracking page\", \"Add an inventory management page\", or \"Add a supplier dashboard page\". Once a page exists I can also add widgets to it or answer questions about stock, POs, and suppliers.",
      delayMs: 1000,
    };
  }

  return {
    text: "I'm not sure about that yet. Try asking me to build a page — e.g. \"Build me a dashboard\" — or ask \"help\" for more examples.",
    delayMs: 1200,
  };
}
