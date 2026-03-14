export interface Receipt {
  id: string
  reference: string
  from: string
  to: string
  contact: string
  scheduleDate: string
  status: "Draft" | "Ready" | "Done"
}

