export type DashboardSourceType =
  | "Receipt"
  | "Delivery"
  | "Transfer"
  | "Adjustment";

export type DashboardStatus =
  | "Draft"
  | "Waiting"
  | "Ready"
  | "Done"
  | "Canceled";

export interface DashboardFilters {
  sourceType?: DashboardSourceType | "";
  status?: DashboardStatus | "";
  warehouseId?: string;
  locationId?: string;
  categoryId?: string;
}

export interface DashboardKpis {
  totalProductsInStock: number;
  totalUnitsOnHand: number;
  lowStockItems: number;
  outOfStockItems: number;
  pendingReceipts: number;
  pendingDeliveries: number;
  scheduledTransfers: number;
  openAdjustments: number;
  receiptSummary: {
    toReceive: number;
    late: number;
    operations: number;
  };
  deliverySummary: {
    toDeliver: number;
    late: number;
    waiting: number;
    operations: number;
  };
}

export interface DashboardActivity {
  _id: string;
  sourceType: DashboardSourceType;
  sourceNo?: string;
  direction: "IN" | "OUT" | "ADJUST";
  quantity: number;
  movementAt: string;
  createdAt: string;
}
