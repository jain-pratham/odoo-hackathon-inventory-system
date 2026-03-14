export interface OperationStats {
  toReceive: number
  late: number
  operations: number
}

export interface DashboardData {
  receipts: OperationStats
  deliveries: OperationStats
}