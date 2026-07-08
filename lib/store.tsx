"use client";

import React, { createContext, useContext, useMemo, useReducer } from "react";
import type {
  Material,
  Supplier,
  PurchaseOrder,
  StockRequest,
  SupplyRequest,
  InwardRecord,
  OutwardRecord,
  AuditEntry,
  Toast,
  BOMItem,
  AssistantMessage,
  DashboardWidgetKey,
  CustomPageKey,
  CorePageKey,
  ViewKey,
  PageFeatureKey,
} from "./types";
import {
  materials as seedMaterials,
  suppliers as seedSuppliers,
  purchaseOrders as seedPOs,
  stockRequests as seedStockRequests,
  supplyRequests as seedSupplyRequests,
  inwardRecords as seedInward,
  outwardRecords as seedOutward,
  initialAuditLog,
  COMPANY_ADDRESS,
} from "./seed-data";

interface State {
  materials: Material[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  stockRequests: StockRequest[];
  supplyRequests: SupplyRequest[];
  inwardRecords: InwardRecord[];
  outwardRecords: OutwardRecord[];
  auditLog: AuditEntry[];
  toasts: Toast[];
  assistantMessages: AssistantMessage[];
  dashboardWidgets: DashboardWidgetKey[];
  customPages: CustomPageKey[];
  unlockedPages: CorePageKey[];
  activePageFeatures: PageFeatureKey[];
  pendingNavigation: ViewKey | null;
  activeSupplyRequest: { materialId: string; qty?: number; linkedStockRequestId?: string } | null;
}

type Action =
  | { type: "MOVE_TO_PRODUCTION"; poId: string }
  | { type: "START_PRODUCTION"; poId: string }
  | { type: "COMPLETE_PRODUCTION"; poId: string }
  | { type: "RAISE_REQUESTS"; poId: string; items: { materialId: string; qty: number }[] }
  | { type: "ACCEPT_REQUEST"; requestId: string }
  | { type: "REJECT_REQUEST"; requestId: string }
  | {
      type: "SEND_SUPPLY_REQUEST";
      materialId: string;
      qty: number;
      urgency: SupplyRequest["urgency"];
      requestedDeliveryDate: string;
      linkedStockRequestId?: string;
    }
  | { type: "ACCEPT_SUPPLY"; supplyId: string }
  | { type: "REJECT_SUPPLY"; supplyId: string }
  | { type: "DISMISS_TOAST"; toastId: string }
  | { type: "ASSISTANT_ASK"; text: string }
  | {
      type: "ASSISTANT_REPLY";
      text: string;
      addWidget?: DashboardWidgetKey;
      removeWidget?: DashboardWidgetKey;
      addPage?: CustomPageKey;
      removePage?: CustomPageKey;
      unlockPage?: CorePageKey;
      addPageFeature?: PageFeatureKey;
      removePageFeature?: PageFeatureKey;
      navigateTo?: ViewKey;
    }
  | {
      type: "OPEN_SUPPLY_MODAL";
      materialId: string;
      qty?: number;
      linkedStockRequestId?: string;
    }
  | { type: "CLOSE_SUPPLY_MODAL" }
  | { type: "REMOVE_DASHBOARD_WIDGET"; widget: DashboardWidgetKey }
  | { type: "REMOVE_CUSTOM_PAGE"; page: CustomPageKey }
  | { type: "CLEAR_PENDING_NAVIGATION" };

const WIDGET_LABELS: Record<DashboardWidgetKey, string> = {
  "supplier-insights": "Supplier Insights",
  "delivery-timeline": "Delivery Timeline",
  "pending-requests": "Pending Stock Requests",
  "po-status-breakdown": "PO Status Breakdown",
  "critical-materials": "Critical Materials",
};

const PAGE_LABELS: Record<CustomPageKey, string> = {
  "low-stock": "Low Stock",
};

const CORE_PAGE_LABELS: Record<CorePageKey, string> = {
  dashboard: "Dashboard",
  "po-upload": "PO Upload & Processing",
  production: "Production",
  inventory: "Inventory Management",
  supplier: "Supplier Dashboard",
};

const PAGE_FEATURE_LABELS: Record<PageFeatureKey, string> = {
  "inventory-highlight-critical": "Highlight Critical Materials",
  "production-sort-urgent": "Sort by Delivery Urgency",
  "po-upload-filter-active": "Filter to Active POs",
  "supplier-sort-rating": "Sort by Rating",
  "low-stock-sort-severity": "Sort by Severity",
};

const PAGE_FEATURE_PAGE_LABELS: Record<PageFeatureKey, string> = {
  "inventory-highlight-critical": "Inventory",
  "production-sort-urgent": "Production",
  "po-upload-filter-active": "PO Upload & Processing",
  "supplier-sort-rating": "Supplier Dashboard",
  "low-stock-sort-severity": "Low Stock",
};

let idCounter = 10000;
function nextId(prefix: string) {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

function nowStamp() {
  const d = new Date();
  return d.toLocaleString("en-IN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function pushAudit(log: AuditEntry[], message: string): AuditEntry[] {
  return [{ id: nextId("AUD"), timestamp: nowStamp(), message }, ...log].slice(0, 50);
}

function pushToast(toasts: Toast[], type: Toast["type"], message: string): Toast[] {
  return [...toasts, { id: nextId("TST"), type, message }];
}

export function aggregatePoMaterials(po: PurchaseOrder): BOMItem[] {
  const map = new Map<string, BOMItem>();
  for (const kit of po.kits) {
    for (const comp of kit.components) {
      for (const item of comp.bom) {
        const existing = map.get(item.materialName);
        if (existing) {
          existing.qtyRequired += item.qtyRequired;
        } else {
          map.set(item.materialName, { ...item });
        }
      }
    }
  }
  return Array.from(map.values());
}

function findMissingMaterials(po: PurchaseOrder, materials: Material[]): string[] {
  const names = new Set(materials.map((m) => m.name));
  const missing = new Set<string>();
  for (const item of aggregatePoMaterials(po)) {
    if (!names.has(item.materialName)) missing.add(item.materialName);
  }
  return Array.from(missing);
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "MOVE_TO_PRODUCTION": {
      const po = state.purchaseOrders.find((p) => p.id === action.poId);
      if (!po) return state;
      const missing = findMissingMaterials(po, state.materials);
      if (missing.length > 0) {
        return {
          ...state,
          toasts: pushToast(
            state.toasts,
            "error",
            `Cannot move ${po.poNumber} to production: missing material(s) — ${missing.join(", ")}`
          ),
        };
      }
      return {
        ...state,
        purchaseOrders: state.purchaseOrders.map((p) =>
          p.id === action.poId ? { ...p, status: "pending" } : p
        ),
        auditLog: pushAudit(state.auditLog, `${po.poNumber} moved to production (Ready for Production)`),
        toasts: pushToast(state.toasts, "success", `${po.poNumber} is now ready for production.`),
      };
    }
    case "START_PRODUCTION": {
      const po = state.purchaseOrders.find((p) => p.id === action.poId);
      if (!po) return state;
      return {
        ...state,
        purchaseOrders: state.purchaseOrders.map((p) =>
          p.id === action.poId ? { ...p, status: "in_progress" } : p
        ),
        auditLog: pushAudit(state.auditLog, `${po.poNumber} production started`),
        toasts: pushToast(state.toasts, "info", `${po.poNumber} moved to In Progress.`),
      };
    }
    case "COMPLETE_PRODUCTION": {
      const po = state.purchaseOrders.find((p) => p.id === action.poId);
      if (!po) return state;
      return {
        ...state,
        purchaseOrders: state.purchaseOrders.map((p) =>
          p.id === action.poId ? { ...p, status: "completed" } : p
        ),
        auditLog: pushAudit(state.auditLog, `${po.poNumber} marked as Completed`),
        toasts: pushToast(state.toasts, "success", `${po.poNumber} completed.`),
      };
    }
    case "RAISE_REQUESTS": {
      const po = state.purchaseOrders.find((p) => p.id === action.poId);
      if (!po) return state;
      const newRequests: StockRequest[] = [];
      for (const item of action.items) {
        const material = state.materials.find((m) => m.id === item.materialId);
        if (!material) continue;
        const alreadyOpen = state.stockRequests.some(
          (r) => r.poId === po.id && r.materialId === material.id && r.status !== "rejected"
        );
        if (alreadyOpen) continue;
        newRequests.push({
          id: nextId("REQ"),
          poId: po.id,
          poNumber: po.poNumber,
          materialId: material.id,
          materialName: material.name,
          unit: material.unit,
          qtyRequested: item.qty,
          dateRequested: todayIso(),
          status: "pending",
        });
      }
      if (newRequests.length === 0) {
        return {
          ...state,
          toasts: pushToast(state.toasts, "info", `No new requests to raise for ${po.poNumber}.`),
        };
      }
      return {
        ...state,
        stockRequests: [...newRequests, ...state.stockRequests],
        auditLog: pushAudit(
          state.auditLog,
          `Raised ${newRequests.length} stock request(s) for ${po.poNumber}`
        ),
        toasts: pushToast(state.toasts, "success", `Raised ${newRequests.length} request(s) for ${po.poNumber}.`),
      };
    }
    case "ACCEPT_REQUEST": {
      const request = state.stockRequests.find((r) => r.id === action.requestId);
      if (!request || request.status !== "pending") return state;
      const material = state.materials.find((m) => m.id === request.materialId);
      if (!material || material.currentStock < request.qtyRequested) {
        return {
          ...state,
          toasts: pushToast(state.toasts, "error", `Insufficient stock to accept ${request.materialName}.`),
        };
      }
      return {
        ...state,
        materials: state.materials.map((m) =>
          m.id === material.id ? { ...m, currentStock: m.currentStock - request.qtyRequested } : m
        ),
        stockRequests: state.stockRequests.map((r) =>
          r.id === request.id ? { ...r, status: "accepted" } : r
        ),
        outwardRecords: [
          {
            id: nextId("OUT"),
            materialId: material.id,
            materialName: material.name,
            unit: material.unit,
            qty: request.qtyRequested,
            date: todayIso(),
            poId: request.poId,
            poNumber: request.poNumber,
          },
          ...state.outwardRecords,
        ],
        auditLog: pushAudit(
          state.auditLog,
          `Accepted request ${request.id}: issued ${request.qtyRequested} ${material.unit} ${material.name} to ${request.poNumber}`
        ),
        toasts: pushToast(state.toasts, "success", `Stock issued for ${request.poNumber}.`),
      };
    }
    case "REJECT_REQUEST": {
      const request = state.stockRequests.find((r) => r.id === action.requestId);
      if (!request || request.status !== "pending") return state;
      return {
        ...state,
        stockRequests: state.stockRequests.map((r) =>
          r.id === request.id ? { ...r, status: "rejected" } : r
        ),
        auditLog: pushAudit(state.auditLog, `Rejected request ${request.id} (${request.materialName}) for ${request.poNumber}`),
        toasts: pushToast(state.toasts, "warning", `Request ${request.id} rejected.`),
      };
    }
    case "SEND_SUPPLY_REQUEST": {
      const material = state.materials.find((m) => m.id === action.materialId);
      if (!material) return state;
      const supplier = state.suppliers.find((s) => s.id === material.supplierId);
      const newSupply: SupplyRequest = {
        id: nextId("SR"),
        materialId: material.id,
        materialName: material.name,
        unit: material.unit,
        supplierId: material.supplierId,
        qtyRequested: action.qty,
        urgency: action.urgency,
        dateRequested: todayIso(),
        requestedDeliveryDate: action.requestedDeliveryDate,
        status: "requested",
        linkedStockRequestId: action.linkedStockRequestId,
      };
      return {
        ...state,
        supplyRequests: [newSupply, ...state.supplyRequests],
        auditLog: pushAudit(
          state.auditLog,
          `Supply request sent to ${supplier?.companyName ?? "supplier"} for ${action.qty} ${material.unit} ${material.name}`
        ),
        toasts: pushToast(state.toasts, "success", `Supply request sent to ${supplier?.companyName}.`),
      };
    }
    case "ACCEPT_SUPPLY": {
      const supply = state.supplyRequests.find((s) => s.id === action.supplyId);
      if (!supply || supply.status !== "requested") return state;
      const material = state.materials.find((m) => m.id === supply.materialId);
      const supplier = state.suppliers.find((s) => s.id === supply.supplierId);
      if (!material) return state;
      return {
        ...state,
        materials: state.materials.map((m) =>
          m.id === material.id ? { ...m, currentStock: m.currentStock + supply.qtyRequested } : m
        ),
        supplyRequests: state.supplyRequests.map((s) =>
          s.id === supply.id ? { ...s, status: "delivered" } : s
        ),
        inwardRecords: [
          {
            id: nextId("IN"),
            materialId: material.id,
            materialName: material.name,
            unit: material.unit,
            qty: supply.qtyRequested,
            date: todayIso(),
            supplierId: supply.supplierId,
            supplierName: supplier?.companyName ?? "",
          },
          ...state.inwardRecords,
        ],
        auditLog: pushAudit(
          state.auditLog,
          `Supply accepted from ${supplier?.companyName}: ${supply.qtyRequested} ${material.unit} ${material.name} added to stock`
        ),
        toasts: pushToast(state.toasts, "success", `${material.name} stock replenished.`),
      };
    }
    case "REJECT_SUPPLY": {
      const supply = state.supplyRequests.find((s) => s.id === action.supplyId);
      if (!supply || supply.status !== "requested") return state;
      return {
        ...state,
        supplyRequests: state.supplyRequests.map((s) =>
          s.id === supply.id ? { ...s, status: "rejected" } : s
        ),
        auditLog: pushAudit(state.auditLog, `Supply request ${supply.id} rejected (${supply.materialName})`),
        toasts: pushToast(state.toasts, "warning", `Supply request ${supply.id} rejected.`),
      };
    }
    case "DISMISS_TOAST":
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.toastId) };
    case "ASSISTANT_ASK": {
      const userMsg: AssistantMessage = { id: nextId("MSG"), role: "user", text: action.text };
      const loadingMsg: AssistantMessage = { id: "MSG-LOADING", role: "assistant", loading: true };
      return {
        ...state,
        assistantMessages: [
          ...state.assistantMessages.filter((m) => m.id !== "MSG-LOADING"),
          userMsg,
          loadingMsg,
        ],
      };
    }
    case "ASSISTANT_REPLY": {
      const replyMsg: AssistantMessage = { id: nextId("MSG"), role: "assistant", text: action.text };
      const withoutLoading = state.assistantMessages.filter((m) => m.id !== "MSG-LOADING");
      let dashboardWidgets = state.dashboardWidgets;
      let customPages = state.customPages;
      let unlockedPages = state.unlockedPages;
      let activePageFeatures = state.activePageFeatures;
      let auditLog = state.auditLog;
      if (action.addWidget && !dashboardWidgets.includes(action.addWidget)) {
        dashboardWidgets = [...dashboardWidgets, action.addWidget];
        auditLog = pushAudit(auditLog, `AI Assistant added "${WIDGET_LABELS[action.addWidget]}" widget to Dashboard`);
      }
      if (action.removeWidget) {
        dashboardWidgets = dashboardWidgets.filter((w) => w !== action.removeWidget);
        auditLog = pushAudit(auditLog, `AI Assistant removed "${WIDGET_LABELS[action.removeWidget]}" widget from Dashboard`);
      }
      if (action.addPage && !customPages.includes(action.addPage)) {
        customPages = [...customPages, action.addPage];
        auditLog = pushAudit(auditLog, `AI Assistant created a new "${PAGE_LABELS[action.addPage]}" page`);
      }
      if (action.removePage) {
        customPages = customPages.filter((p) => p !== action.removePage);
        auditLog = pushAudit(auditLog, `AI Assistant removed the "${PAGE_LABELS[action.removePage]}" page`);
      }
      if (action.unlockPage && !unlockedPages.includes(action.unlockPage)) {
        unlockedPages = [...unlockedPages, action.unlockPage];
        auditLog = pushAudit(auditLog, `AI Assistant built the "${CORE_PAGE_LABELS[action.unlockPage]}" page`);
      }
      if (action.addPageFeature && !activePageFeatures.includes(action.addPageFeature)) {
        activePageFeatures = [...activePageFeatures, action.addPageFeature];
        auditLog = pushAudit(
          auditLog,
          `AI Assistant enabled "${PAGE_FEATURE_LABELS[action.addPageFeature]}" on ${PAGE_FEATURE_PAGE_LABELS[action.addPageFeature]}`
        );
      }
      if (action.removePageFeature) {
        activePageFeatures = activePageFeatures.filter((f) => f !== action.removePageFeature);
        auditLog = pushAudit(
          auditLog,
          `AI Assistant reverted "${PAGE_FEATURE_LABELS[action.removePageFeature]}" on ${PAGE_FEATURE_PAGE_LABELS[action.removePageFeature]}`
        );
      }
      return {
        ...state,
        assistantMessages: [...withoutLoading, replyMsg],
        dashboardWidgets,
        customPages,
        unlockedPages,
        activePageFeatures,
        pendingNavigation: action.navigateTo ?? state.pendingNavigation,
        auditLog,
      };
    }
    case "OPEN_SUPPLY_MODAL":
      return {
        ...state,
        activeSupplyRequest: {
          materialId: action.materialId,
          qty: action.qty,
          linkedStockRequestId: action.linkedStockRequestId,
        },
      };
    case "CLOSE_SUPPLY_MODAL":
      return { ...state, activeSupplyRequest: null };
    case "REMOVE_DASHBOARD_WIDGET":
      return { ...state, dashboardWidgets: state.dashboardWidgets.filter((w) => w !== action.widget) };
    case "REMOVE_CUSTOM_PAGE":
      return { ...state, customPages: state.customPages.filter((p) => p !== action.page) };
    case "CLEAR_PENDING_NAVIGATION":
      return { ...state, pendingNavigation: null };
    default:
      return state;
  }
}

const initialState: State = {
  materials: seedMaterials,
  suppliers: seedSuppliers,
  purchaseOrders: seedPOs,
  stockRequests: seedStockRequests,
  supplyRequests: seedSupplyRequests,
  inwardRecords: seedInward,
  outwardRecords: seedOutward,
  auditLog: initialAuditLog,
  toasts: [],
  assistantMessages: [
    {
      id: "MSG-0",
      role: "assistant",
      text:
        "Hi Admin, welcome to Vijaya Electronics. This workspace is empty right now — I'll build each page live as you ask for it. Try: \"Build me a dashboard\" to get started.",
    },
  ],
  dashboardWidgets: [],
  customPages: [],
  unlockedPages: [],
  activePageFeatures: [],
  pendingNavigation: null,
  activeSupplyRequest: null,
};

interface StoreContextValue extends State {
  dispatch: React.Dispatch<Action>;
  companyAddress: string;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = useMemo(() => ({ ...state, dispatch, companyAddress: COMPANY_ADDRESS }), [state]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
