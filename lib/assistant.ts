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
  PageFeatureKey,
} from "./types";

interface AssistantState {
  materials: Material[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  stockRequests: StockRequest[];
  supplyRequests: SupplyRequest[];
  unlockedPages: CorePageKey[];
  activePageFeatures: PageFeatureKey[];
}

export interface AssistantReply {
  text: string;
  addWidget?: DashboardWidgetKey;
  removeWidget?: DashboardWidgetKey;
  addPage?: CustomPageKey;
  removePage?: CustomPageKey;
  unlockPage?: CorePageKey;
  addPageFeature?: PageFeatureKey;
  removePageFeature?: PageFeatureKey;
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

interface PageFeatureIntent {
  key: PageFeatureKey;
  label: string;
  page: ViewKey;
  matches: (q: string) => boolean;
  addDelayMs: number;
  addText: string;
}

const PAGE_FEATURE_INTENTS: PageFeatureIntent[] = [
  {
    key: "inventory-highlight-critical",
    label: "Highlight Critical Materials",
    page: "inventory",
    matches: (q) => q.includes("highlight") && (q.includes("critical") || q.includes("low stock") || q.includes("low-stock")),
    addDelayMs: 1400,
    addText: "Done — sorting critical materials to the top of the stock table and highlighting them.",
  },
  {
    key: "production-sort-urgent",
    label: "Sort by Delivery Urgency",
    page: "production",
    matches: (q) => (q.includes("sort") || q.includes("order")) && (q.includes("urgen") || q.includes("delivery") || q.includes("deadline")),
    addDelayMs: 1400,
    addText: "Done — reordering production cards so the nearest delivery deadlines show first.",
  },
  {
    key: "po-upload-filter-active",
    label: "Filter to Active POs",
    page: "po-upload",
    matches: (q) => q.includes("only pending") || q.includes("filter pending") || q.includes("only active") || (q.includes("filter") && q.includes("active")),
    addDelayMs: 1300,
    addText: "Done — filtering the purchase order list down to active (non-completed) POs.",
  },
  {
    key: "supplier-sort-rating",
    label: "Sort by Rating",
    page: "supplier",
    matches: (q) => q.includes("sort") && q.includes("rating") || q.includes("best supplier"),
    addDelayMs: 1300,
    addText: "Done — sorting suppliers by reliability rating, highest first.",
  },
  {
    key: "low-stock-sort-severity",
    label: "Sort by Severity",
    page: "low-stock",
    matches: (q) => q.includes("severity") || q.includes("most critical"),
    addDelayMs: 1300,
    addText: "Done — sorting the low stock list so the most critical materials show first.",
  },
];

const PAGE_CAPABILITY_HINTS: Partial<Record<ViewKey, string>> = {
  dashboard: "On this Dashboard I can add or remove widgets — Supplier Insights, Delivery Timeline, Pending Requests, PO Status Breakdown, Critical Materials.",
  "po-upload": "On this PO Upload page I can look up a PO by number, tell you which POs are missing materials, or filter the list down to active POs.",
  production: "On this Production page I can tell you which PO is most urgent, or sort the cards by delivery deadline.",
  inventory: "On this Inventory page I can highlight critical materials, list what's low on stock, or spin up a dedicated Low Stock page.",
  supplier: "On this Supplier Dashboard I can sort suppliers by rating, look up a supplier by name, or tell you how many supply requests are open.",
  "low-stock": "On this Low Stock page I can sort materials by severity, or take you back to Inventory.",
};

const BOOTSTRAP_SUGGESTIONS = [
  "Build me a dashboard",
  "Add a PO upload page",
  "Add a production tracking page",
  "Add an inventory management page",
  "Add a supplier dashboard page",
];

const ADVANCED_SUGGESTIONS = [
  "Which materials are low on stock?",
  "Status of PO-002",
  "Add supplier dashboard insight to the main dashboard",
  "Add delivery timeline to dashboard",
  "Add a new page for just displaying the stocks which are low",
];

export interface SuggestionContext {
  dashboardWidgets: DashboardWidgetKey[];
  customPages: CustomPageKey[];
  activePageFeatures: PageFeatureKey[];
}

interface SuggestionCandidate {
  text: string;
  satisfied?: (ctx: SuggestionContext) => boolean;
}

const PAGE_SUGGESTION_CANDIDATES: Partial<Record<ViewKey, SuggestionCandidate[]>> = {
  dashboard: [
    { text: "Add a Supplier Insights widget", satisfied: (c) => c.dashboardWidgets.includes("supplier-insights") },
    { text: "Add a PO Status Breakdown widget", satisfied: (c) => c.dashboardWidgets.includes("po-status-breakdown") },
    { text: "Add a Delivery Timeline widget", satisfied: (c) => c.dashboardWidgets.includes("delivery-timeline") },
    { text: "Add a Pending Stock Requests widget", satisfied: (c) => c.dashboardWidgets.includes("pending-requests") },
    { text: "Add a Critical Materials widget", satisfied: (c) => c.dashboardWidgets.includes("critical-materials") },
    { text: "Which materials are low on stock?" },
    { text: "Show pending stock requests" },
  ],
  "po-upload": [
    { text: "Show only pending POs", satisfied: (c) => c.activePageFeatures.includes("po-upload-filter-active") },
    { text: "Status of PO-002" },
    { text: "Which POs are missing materials?" },
  ],
  production: [
    { text: "Sort by delivery urgency", satisfied: (c) => c.activePageFeatures.includes("production-sort-urgent") },
    { text: "Which PO is most urgent?" },
    { text: "Which materials are low on stock?" },
  ],
  inventory: [
    { text: "Highlight critical materials", satisfied: (c) => c.activePageFeatures.includes("inventory-highlight-critical") },
    { text: "Add a page for just low stock materials", satisfied: (c) => c.customPages.includes("low-stock") },
    { text: "Which materials are low on stock?" },
    { text: "How many pending requests are there?" },
  ],
  supplier: [
    { text: "Sort suppliers by rating", satisfied: (c) => c.activePageFeatures.includes("supplier-sort-rating") },
    { text: "Add supplier insights to dashboard", satisfied: (c) => c.dashboardWidgets.includes("supplier-insights") },
    { text: "How many supply requests are open?" },
  ],
  "low-stock": [
    { text: "Sort by most critical", satisfied: (c) => c.activePageFeatures.includes("low-stock-sort-severity") },
    { text: "Take me to Inventory" },
  ],
};

const SUGGESTION_BACKFILL = ["Which materials are low on stock?", "Show pending stock requests", "How many supply requests are open?"];

export function getSuggestedPrompts(page: ViewKey, unlockedPages: CorePageKey[], ctx: SuggestionContext): string[] {
  if (page === "assistant") {
    return unlockedPages.length === 0 ? BOOTSTRAP_SUGGESTIONS : ADVANCED_SUGGESTIONS;
  }
  const candidates = PAGE_SUGGESTION_CANDIDATES[page];
  if (!candidates) return ADVANCED_SUGGESTIONS;
  const active = candidates.filter((s) => !s.satisfied?.(ctx)).map((s) => s.text);
  for (const fallback of SUGGESTION_BACKFILL) {
    if (active.length >= 3) break;
    if (!active.includes(fallback)) active.push(fallback);
  }
  return active.slice(0, 3);
}

function daysUntilDelivery(dateStr: string) {
  const target = new Date(dateStr).getTime();
  const now = new Date("2026-07-07").getTime();
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

function mostUrgentPo(purchaseOrders: PurchaseOrder[]): PurchaseOrder | null {
  const visible = purchaseOrders.filter((p) => p.status !== "draft" && p.status !== "completed");
  if (visible.length === 0) return null;
  return visible.reduce((soonest, p) => (daysUntilDelivery(p.deliveryDate) < daysUntilDelivery(soonest.deliveryDate) ? p : soonest));
}

function listLowStock(materials: Material[]) {
  return materials.filter((m) => m.currentStock <= m.reorderPoint);
}

function needsCorePageMessage(requirement: CorePageKey, forLabel: string): string {
  return `I'll need to build the ${CORE_PAGE_LABELS[requirement]} page first — try asking me to build that before requesting the ${forLabel} page.`;
}

export function generateReply(rawQuery: string, state: AssistantState, page: ViewKey): AssistantReply {
  const q = rawQuery.trim().toLowerCase();

  if (!q) {
    return {
      text: "Tell me what to build — try \"Build me a dashboard\" to get started, or ask a question about stock, POs, or suppliers.",
      delayMs: 900,
    };
  }

  const isRemove = /\b(remove|delete|hide|dismiss|undo|revert)\b/.test(q);

  for (const intent of PAGE_FEATURE_INTENTS) {
    if (intent.page !== page) continue;
    if (!intent.matches(q)) continue;
    if (isRemove) {
      return {
        text: `Done — reverted "${intent.label}" back to the default view.`,
        removePageFeature: intent.key,
        delayMs: 900,
      };
    }
    if (state.activePageFeatures.includes(intent.key)) {
      return { text: `"${intent.label}" is already active on this page.`, delayMs: 700 };
    }
    return { text: intent.addText, addPageFeature: intent.key, delayMs: intent.addDelayMs };
  }

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

  if (page === "production" && (q.includes("most urgent") || q.includes("most overdue") || q.includes("which po") || q.includes("overdue"))) {
    const po = mostUrgentPo(state.purchaseOrders);
    if (!po) {
      return { text: "There are no POs in production right now.", delayMs: 1000 };
    }
    const days = daysUntilDelivery(po.deliveryDate);
    return {
      text: `${po.poNumber} (${po.clientName}) is the most time-critical — delivery ${po.deliveryDate}, ${days >= 0 ? `${days} day(s) away` : "already overdue"}.`,
      delayMs: 1200,
    };
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

  const pageHint = PAGE_CAPABILITY_HINTS[page];

  if (q.includes("help") || q.includes("what can you")) {
    const base = "I can build pages for you — try \"Build me a dashboard\", \"Add a PO upload page\", \"Add a production tracking page\", \"Add an inventory management page\", or \"Add a supplier dashboard page\". Once a page exists I can also add widgets to it or answer questions about stock, POs, and suppliers.";
    return {
      text: pageHint ? `${pageHint}\n\n${base}` : base,
      delayMs: 1000,
    };
  }

  return {
    text: pageHint
      ? `I'm not sure about that yet. ${pageHint} Or ask "help" for more examples.`
      : "I'm not sure about that yet. Try asking me to build a page — e.g. \"Build me a dashboard\" — or ask \"help\" for more examples.",
    delayMs: 1200,
  };
}
