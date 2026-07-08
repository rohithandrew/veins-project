export type POStatus = "draft" | "pending" | "in_progress" | "completed";

export type RequestStatus = "pending" | "accepted" | "rejected";

export type SupplyStatus = "requested" | "delivered" | "rejected";

export interface Material {
  id: string;
  name: string;
  category: string;
  unit: string;
  currentStock: number;
  reorderPoint: number;
  supplierId: string;
}

export interface Supplier {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  rating: number;
  avgResponseTimeHours: number;
}

export interface BOMItem {
  materialName: string;
  qtyRequired: number;
  unit: string;
}

export interface KitComponent {
  id: string;
  name: string;
  bom: BOMItem[];
}

export interface Kit {
  id: string;
  name: string;
  components: KitComponent[];
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  clientName: string;
  clientContact: string;
  createdDate: string;
  deliveryDate: string;
  kits: Kit[];
  status: POStatus;
}

export interface StockRequest {
  id: string;
  poId: string;
  poNumber: string;
  materialId: string;
  materialName: string;
  unit: string;
  qtyRequested: number;
  dateRequested: string;
  status: RequestStatus;
}

export interface SupplyRequest {
  id: string;
  materialId: string;
  materialName: string;
  unit: string;
  supplierId: string;
  qtyRequested: number;
  urgency: "Normal" | "Urgent" | "Critical";
  dateRequested: string;
  requestedDeliveryDate: string;
  status: SupplyStatus;
  linkedStockRequestId?: string;
}

export interface InwardRecord {
  id: string;
  materialId: string;
  materialName: string;
  unit: string;
  qty: number;
  date: string;
  supplierId: string;
  supplierName: string;
}

export interface OutwardRecord {
  id: string;
  materialId: string;
  materialName: string;
  unit: string;
  qty: number;
  date: string;
  poId: string;
  poNumber: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  message: string;
}

export interface Toast {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
}

export type CustomPageKey = "low-stock";

export type CorePageKey = "dashboard" | "po-upload" | "production" | "inventory" | "supplier";

export type ViewKey = CorePageKey | "assistant" | CustomPageKey;

export type DashboardWidgetKey =
  | "supplier-insights"
  | "delivery-timeline"
  | "pending-requests"
  | "po-status-breakdown"
  | "critical-materials";

export type PageFeatureKey =
  | "inventory-highlight-critical"
  | "production-sort-urgent"
  | "po-upload-filter-active"
  | "supplier-sort-rating"
  | "low-stock-sort-severity";

export interface AssistantMessage {
  id: string;
  role: "assistant" | "user";
  text?: string;
  loading?: boolean;
}
