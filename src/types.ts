/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  SUPER_ADMIN = "Super Admin",
  ADMIN = "Admin",
  CEO = "CEO",
  MANAGER = "Manager",
  HR = "HR",
  ACCOUNTANT = "Accountant",
  SALES = "Sales",
  INVENTORY_OFFICER = "Inventory Officer",
  WAREHOUSE_MANAGER = "Warehouse Manager",
  PROCUREMENT_OFFICER = "Procurement Officer",
  PROJECT_MANAGER = "Project Manager",
  EMPLOYEE = "Employee",
  SUPPLIER = "Supplier Portal",
  CUSTOMER = "Customer Portal",
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId: string;
  branchId: string;
  avatarUrl?: string;
  tin?: string;
  phone?: string;
  status: "Active" | "Inactive";
}

export interface Company {
  id: string;
  name: string;
  tin: string; // Tax Identification Number
  vatRegistered: boolean;
  currency: string; // e.g. ETB, USD
  address: string;
  phone: string;
  email: string;
}

export interface Branch {
  id: string;
  companyId: string;
  name: string;
  address: string;
  phone: string;
}

export interface Department {
  id: string;
  companyId: string;
  branchId: string;
  name: string;
  managerId?: string;
}

export interface Warehouse {
  id: string;
  companyId: string;
  branchId: string;
  name: string;
  address: string;
}

// HR MODULE
export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  departmentId: string;
  branchId: string;
  companyId: string;
  hireDate: string;
  salary: number; // Monthly salary
  status: "Active" | "On Leave" | "Suspended" | "Terminated";
  attendance: AttendanceRecord[];
  leaves: LeaveRecord[];
  performance: PerformanceReview[];
  training: TrainingRecord[];
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  status: "Present" | "Absent" | "Late" | "Half Day";
}

export interface LeaveRecord {
  id: string;
  employeeId: string;
  leaveType: "Annual" | "Sick" | "Maternity" | "Paternity" | "Unpaid";
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  reviewDate: string;
  reviewerId: string;
  score: number; // 1 to 5
  comments: string;
  goals: string[];
}

export interface TrainingRecord {
  id: string;
  title: string;
  description: string;
  date: string;
  durationHours: number;
  status: "Assigned" | "In Progress" | "Completed";
  employees: string[]; // employeeIds
}

// FINANCE MODULE
export interface ChartOfAccount {
  id: string;
  companyId: string;
  code: string; // Account Code, e.g., 1000, 2000
  name: string;
  category: "Asset" | "Liability" | "Equity" | "Revenue" | "Expense";
  balance: number;
}

export interface JournalEntry {
  id: string;
  companyId: string;
  branchId: string;
  date: string;
  description: string;
  reference?: string;
  items: JournalItem[];
  status: "Draft" | "Posted";
}

export interface JournalItem {
  accountId: string;
  accountName: string;
  debit: number;
  credit: number;
}

export interface Budget {
  id: string;
  companyId: string;
  departmentId: string;
  year: number;
  allocatedAmount: number;
  spentAmount: number;
}

export interface BankReconciliation {
  id: string;
  companyId: string;
  bankAccountId: string;
  statementDate: string;
  bankBalance: number;
  bookBalance: number;
  difference: number;
  status: "Unreconciled" | "Reconciled";
}

// INVENTORY MODULE
export interface Product {
  id: string;
  companyId: string;
  sku: string;
  name: string;
  category: string;
  barcode: string;
  qrCode: string;
  description?: string;
  price: number; // Selling price
  cost: number;  // Cost price
  stock: { [warehouseId: string]: number }; // warehouseId -> quantity
  reorderPoint: number;
}

export interface StockTransfer {
  id: string;
  companyId: string;
  productId: string;
  productName: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  quantity: number;
  date: string;
  status: "Pending" | "Completed" | "Cancelled";
}

export interface StockAdjustment {
  id: string;
  companyId: string;
  warehouseId: string;
  productId: string;
  productName: string;
  quantityAdjusted: number; // can be negative
  reason: string;
  date: string;
}

// PURCHASE MANAGEMENT
export interface Supplier {
  id: string;
  companyId: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  tin?: string;
  address: string;
  productsSupplied?: string[];
}

export interface PurchaseRequest {
  id: string;
  companyId: string;
  departmentId: string;
  requestedById: string;
  requestedByName: string;
  date: string;
  items: PurchaseItem[];
  status: "Pending" | "Approved" | "Rejected";
}

export interface PurchaseOrder {
  id: string;
  companyId: string;
  supplierId: string;
  supplierName: string;
  date: string;
  items: PurchaseItem[];
  totalAmount: number;
  status: "Draft" | "Ordered" | "Received" | "Billed" | "Paid";
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

// SALES MODULE
export interface Customer {
  id: string;
  companyId: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  tin?: string;
  address: string;
}

export interface Lead {
  id: string;
  companyId: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: "New" | "Contacted" | "Qualified" | "Lost" | "Won";
  source: "Web" | "Referral" | "Social Media" | "Cold Call";
  assignedToId?: string;
  assignedToName?: string;
  stage?: string;
  contactName?: string;
  value?: number;
}

export interface SalesOrder {
  id: string;
  companyId: string;
  branchId: string;
  customerId: string;
  customerName: string;
  date: string;
  items: SalesItem[];
  totalAmount: number;
  status: "Draft" | "Confirmed" | "Shipped" | "Invoiced" | "Paid" | "Returned";
  shippingAddress: string;
  paymentMethod?: string;
}

export interface SalesItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

// PROJECTS MODULE
export interface Project {
  id: string;
  companyId: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: "Planning" | "In Progress" | "On Hold" | "Completed" | "Cancelled";
  managerId: string;
  managerName: string;
  budget: number;
  milestones: Milestone[];
}

export interface Milestone {
  id: string;
  title: string;
  dueDate: string;
  status: "Pending" | "Completed";
}

export interface Task {
  id: string;
  projectId: string;
  projectName: string;
  title: string;
  description: string;
  assigneeId: string;
  assigneeName: string;
  startDate: string;
  dueDate: string;
  status: "Todo" | "In Progress" | "Review" | "Done";
  priority: "Low" | "Medium" | "High";
  timeSpentMinutes: number;
}

export interface Timesheet {
  id: string;
  employeeId: string;
  employeeName: string;
  taskId: string;
  taskTitle: string;
  date: string;
  durationMinutes: number;
  description: string;
}

// ASSETS MODULE
export interface Asset {
  id: string;
  companyId: string;
  branchId: string;
  name: string;
  category: "IT Equipment" | "Vehicles" | "Machinery" | "Real Estate" | "Office Furniture";
  cost: number;
  acquisitionDate: string;
  salvageValue: number;
  usefulLifeYears: number;
  accumulatedDepreciation: number;
  assignedToId?: string;
  assignedToName?: string;
  maintenanceSchedule: {
    lastMaintenanceDate?: string;
    nextMaintenanceDate: string;
    intervalMonths: number;
    notes?: string;
  };
}

// HELP DESK MODULE
export interface Ticket {
  id: string;
  companyId: string;
  customerId?: string;
  customerName: string;
  subject: string;
  description: string;
  category: "Technical" | "Billing" | "Product Info" | "Account Access" | "Other";
  priority: "Low" | "Medium" | "High";
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  createdAt: string;
  assignedToId?: string;
  assignedToName?: string;
  chatLog: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  senderName: string;
  senderRole: "Customer" | "Support Agent" | "AI Bot";
  message: string;
  timestamp: string;
}

// SECURITY & AUDIT LOGS
export interface AuditLog {
  id: string;
  companyId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

// SYSTEM NOTIFICATIONS
export interface Notification {
  id: string;
  userId: string;
  title: string;
  content: string;
  type: "In-App" | "Email" | "SMS";
  category: "Finance" | "HR" | "Inventory" | "Sales" | "Projects" | "System";
  status: "Unread" | "Read";
  timestamp: string;
}

// ROLE-BASED ACCESS CONTROL HELPERS
export const ROLE_MODULE_MAP: Record<string, string[]> = {
  [UserRole.CEO]: [
    "dashboard", "hr", "finance", "inventory", "purchase", "sales", "projects", "assets", "helpdesk", "reports", "settings"
  ],
  [UserRole.SUPER_ADMIN]: [
    "dashboard", "hr", "finance", "inventory", "purchase", "sales", "projects", "assets", "helpdesk", "reports", "settings"
  ],
  [UserRole.ADMIN]: [
    "dashboard", "hr", "finance", "inventory", "purchase", "sales", "projects", "assets", "helpdesk", "reports", "settings"
  ],
  [UserRole.HR]: [
    "dashboard", "hr", "projects", "settings"
  ],
  [UserRole.ACCOUNTANT]: [
    "dashboard", "finance", "reports", "settings"
  ],
};

export function isModuleAllowed(role: string, moduleId: string): boolean {
  const normRole = (role || "").toLowerCase();
  
  // Find key in ROLE_MODULE_MAP that matches the role string
  const mappedKey = Object.keys(ROLE_MODULE_MAP).find(
    (key) => key.toLowerCase() === normRole || normRole.includes(key.toLowerCase())
  );
  
  if (mappedKey) {
    return ROLE_MODULE_MAP[mappedKey].includes(moduleId);
  }
  
  // CEO / Admin fallback
  if (normRole.includes("ceo") || normRole.includes("admin") || normRole.includes("super")) {
    return true;
  }
  
  // Default fallback for any other staff role
  return ["dashboard", "settings"].includes(moduleId);
}


