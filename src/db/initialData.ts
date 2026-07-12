/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  UserRole,
  Company,
  Branch,
  Department,
  Warehouse,
  Employee,
  ChartOfAccount,
  Product,
  Supplier,
  Customer,
  Lead,
  SalesOrder,
  PurchaseOrder,
  Project,
  Task,
  Asset,
  Ticket,
  AuditLog,
  Notification,
  JournalEntry,
} from "../types";

export const initialCompanies: Company[] = [
  {
    id: "comp-james-holdings",
    name: "James Industries Holdings PLC",
    tin: "0012457893",
    vatRegistered: true,
    currency: "ETB",
    address: "Bole Road, Ward 03, House 405, Addis Ababa, Ethiopia",
    phone: "+251116612345",
    email: "info@jamesholdings.com",
  },
  {
    id: "comp-hawassa-agro",
    name: "Hawassa Agro-Processing Corp",
    tin: "0098765432",
    vatRegistered: true,
    currency: "ETB",
    address: "Hawassa Industrial Park, Block B, Hawassa, Ethiopia",
    phone: "+251462205678",
    email: "operations@hawassaagro.com",
  },
];

export const initialBranches: Branch[] = [
  {
    id: "branch-addis-hq",
    companyId: "comp-james-holdings",
    name: "Addis Ababa Headquarters",
    address: "Bole Road, Near Friendship Building, Addis Ababa",
    phone: "+251116612345",
  },
  {
    id: "branch-adama",
    companyId: "comp-james-holdings",
    name: "Adama Logistics & Distribution",
    address: "Adama Highway Interchange Road, Adama",
    phone: "+251221118990",
  },
  {
    id: "branch-hawassa-plant",
    companyId: "comp-hawassa-agro",
    name: "Hawassa Manufacturing Plant",
    address: "Industrial Park Rd, Hawassa",
    phone: "+251462205678",
  },
];

export const initialWarehouses: Warehouse[] = [
  {
    id: "wh-addis-main",
    companyId: "comp-james-holdings",
    branchId: "branch-addis-hq",
    name: "Addis Ababa Main Logistics Warehouse",
    address: "Kaliti Industrial Zone, Addis Ababa",
  },
  {
    id: "wh-adama-dist",
    companyId: "comp-james-holdings",
    branchId: "branch-adama",
    name: "Adama Central Distribution Hub",
    address: "Expressway Exit, Adama",
  },
  {
    id: "wh-hawassa-cold",
    companyId: "comp-hawassa-agro",
    branchId: "branch-hawassa-plant",
    name: "Hawassa Cold-Storage & Sorting Facility",
    address: "Industrial Park, Block 12, Hawassa",
  },
];

export const initialDepartments: Department[] = [
  { id: "dept-exec", companyId: "comp-james-holdings", branchId: "branch-addis-hq", name: "Executive Suite" },
  { id: "dept-finance", companyId: "comp-james-holdings", branchId: "branch-addis-hq", name: "Finance & Accounts" },
  { id: "dept-hr", companyId: "comp-james-holdings", branchId: "branch-addis-hq", name: "Human Resources" },
  { id: "dept-sales", companyId: "comp-james-holdings", branchId: "branch-addis-hq", name: "Sales & Marketing" },
  { id: "dept-ops", companyId: "comp-james-holdings", branchId: "branch-adama", name: "Logistics Operations" },
  { id: "dept-hawassa-ops", companyId: "comp-hawassa-agro", branchId: "branch-hawassa-plant", name: "Production & QC" },
];

// In a real database, passwords would be hashed. For the server logic, we can verify raw strings or custom hashes
export const initialEmployees: Employee[] = [
  {
    id: "emp-admin-super",
    name: "Admin Portal",
    email: "admin@jameserp.com",
    phone: "+251911990011",
    role: UserRole.SUPER_ADMIN,
    departmentId: "dept-exec",
    branchId: "branch-addis-hq",
    companyId: "comp-james-holdings",
    hireDate: "2018-06-01",
    salary: 200000,
    status: "Active",
    attendance: [
      { id: "att-admin-1", employeeId: "emp-admin-super", date: "2026-07-10", checkIn: "08:00", checkOut: "18:00", status: "Present" }
    ],
    leaves: [],
    performance: [],
    training: [],
  },
  {
    id: "emp-james-ceo",
    name: "James Kebede",
    email: "ceo@jameserp.com",
    phone: "+251911223344",
    role: UserRole.CEO,
    departmentId: "dept-exec",
    branchId: "branch-addis-hq",
    companyId: "comp-james-holdings",
    hireDate: "2020-01-15",
    salary: 150000,
    status: "Active",
    attendance: [
      { id: "att-1", employeeId: "emp-james-ceo", date: "2026-07-10", checkIn: "08:15", checkOut: "17:45", status: "Present" },
      { id: "att-2", employeeId: "emp-james-ceo", date: "2026-07-11", checkIn: "08:20", checkOut: "17:30", status: "Present" },
    ],
    leaves: [],
    performance: [
      { id: "perf-1", employeeId: "emp-james-ceo", reviewDate: "2025-12-20", reviewerId: "board-chair", score: 5, comments: "Exceptional leadership pushing digital transformation across Ethiopia.", goals: ["Expand to regional hubs", "Implement ERP fully"] }
    ],
    training: [],
  },
  {
    id: "emp-selam-hr",
    name: "Selamawit Alene",
    email: "hr@jameserp.com",
    phone: "+251911556677",
    role: UserRole.HR,
    departmentId: "dept-hr",
    branchId: "branch-addis-hq",
    companyId: "comp-james-holdings",
    hireDate: "2022-03-01",
    salary: 45000,
    status: "Active",
    attendance: [
      { id: "att-3", employeeId: "emp-selam-hr", date: "2026-07-10", checkIn: "08:02", checkOut: "17:05", status: "Present" },
      { id: "att-4", employeeId: "emp-selam-hr", date: "2026-07-11", checkIn: "08:10", checkOut: "17:00", status: "Present" },
    ],
    leaves: [
      { id: "leave-1", employeeId: "emp-selam-hr", leaveType: "Annual", startDate: "2026-08-10", endDate: "2026-08-15", days: 5, reason: "Family vacation to Langano", status: "Approved" }
    ],
    performance: [
      { id: "perf-2", employeeId: "emp-selam-hr", reviewDate: "2025-12-15", reviewerId: "emp-james-ceo", score: 4, comments: "Maintains high employee retention and smooth recruiting pipeline.", goals: ["Roll out employee self-service", "Launch leadership training"] }
    ],
    training: [{ id: "tr-1", title: "Modern HR Compliance in East Africa", description: "Updated labor regulations and employee benefits mapping.", date: "2026-04-12", durationHours: 16, status: "Completed", employees: ["emp-selam-hr"] }],
  },
  {
    id: "emp-yohannes-acc",
    name: "Yohannes Demissie",
    email: "accounting@jameserp.com",
    phone: "+251922334455",
    role: UserRole.ACCOUNTANT,
    departmentId: "dept-finance",
    branchId: "branch-addis-hq",
    companyId: "comp-james-holdings",
    hireDate: "2021-06-15",
    salary: 55000,
    status: "Active",
    attendance: [
      { id: "att-5", employeeId: "emp-yohannes-acc", date: "2026-07-10", checkIn: "08:30", checkOut: "18:00", status: "Present" },
      { id: "att-6", employeeId: "emp-yohannes-acc", date: "2026-07-11", checkIn: "08:45", checkOut: "17:30", status: "Present" },
    ],
    leaves: [],
    performance: [],
    training: [],
  },
  {
    id: "emp-almaz-sales",
    name: "Almaz Tesfaye",
    email: "sales@jameserp.com",
    phone: "+251933445566",
    role: UserRole.SALES,
    departmentId: "dept-sales",
    branchId: "branch-addis-hq",
    companyId: "comp-james-holdings",
    hireDate: "2023-01-10",
    salary: 35000,
    status: "Active",
    attendance: [
      { id: "att-7", employeeId: "emp-almaz-sales", date: "2026-07-10", checkIn: "08:55", checkOut: "17:15", status: "Present" },
      { id: "att-8", employeeId: "emp-almaz-sales", date: "2026-07-11", checkIn: "09:05", checkOut: "17:00", status: "Present" },
    ],
    leaves: [],
    performance: [],
    training: [],
  },
  {
    id: "emp-chala-inventory",
    name: "Chala Bekele",
    email: "inventory@jameserp.com",
    phone: "+251944556677",
    role: UserRole.INVENTORY_OFFICER,
    departmentId: "dept-ops",
    branchId: "branch-adama",
    companyId: "comp-james-holdings",
    hireDate: "2022-09-01",
    salary: 28000,
    status: "Active",
    attendance: [
      { id: "att-9", employeeId: "emp-chala-inventory", date: "2026-07-10", checkIn: "07:55", checkOut: "16:45", status: "Present" },
      { id: "att-10", employeeId: "emp-chala-inventory", date: "2026-07-11", checkIn: "08:00", checkOut: "17:00", status: "Present" },
    ],
    leaves: [],
    performance: [],
    training: [],
  },
];

export const initialChartOfAccounts: ChartOfAccount[] = [
  // ASSETS
  { id: "coa-cash", companyId: "comp-james-holdings", code: "1010", name: "Cash in Bank (CBE Birr/Telebirr)", category: "Asset", balance: 14500000.50 },
  { id: "coa-ar", companyId: "comp-james-holdings", code: "1200", name: "Accounts Receivable", category: "Asset", balance: 3400000.00 },
  { id: "coa-inv", companyId: "comp-james-holdings", code: "1300", name: "Inventory Asset", category: "Asset", balance: 8500000.00 },
  { id: "coa-equip", companyId: "comp-james-holdings", code: "1500", name: "Machinery & Equipment", category: "Asset", balance: 12000000.00 },
  // LIABILITIES
  { id: "coa-ap", companyId: "comp-james-holdings", code: "2010", name: "Accounts Payable", category: "Liability", balance: -2100000.00 },
  { id: "coa-tax", companyId: "comp-james-holdings", code: "2200", name: "VAT & Sales Taxes Payable", category: "Liability", balance: -850000.00 },
  // EQUITY
  { id: "coa-capital", companyId: "comp-james-holdings", code: "3000", name: "Share Capital", category: "Equity", balance: -20000000.00 },
  { id: "coa-re", companyId: "comp-james-holdings", code: "3500", name: "Retained Earnings", category: "Equity", balance: -5450000.50 },
  // REVENUE
  { id: "coa-sales", companyId: "comp-james-holdings", code: "4000", name: "Sales Revenue", category: "Revenue", balance: -28400000.00 },
  { id: "coa-misc-rev", companyId: "comp-james-holdings", code: "4500", name: "Other Operating Revenue", category: "Revenue", balance: -1500000.00 },
  // EXPENSES
  { id: "coa-cogs", companyId: "comp-james-holdings", code: "5000", name: "Cost of Goods Sold (COGS)", category: "Expense", balance: 14200000.00 },
  { id: "coa-salaries", companyId: "comp-james-holdings", code: "5100", name: "Salaries & Benefits", category: "Expense", balance: 3200000.00 },
  { id: "coa-rent", companyId: "comp-james-holdings", code: "5200", name: "Rent & Facilities Expense", category: "Expense", balance: 1800000.00 },
  { id: "coa-deprec", companyId: "comp-james-holdings", code: "5500", name: "Depreciation Expense", category: "Expense", balance: 1100000.00 },
];

export const initialProducts: Product[] = [
  {
    id: "prod-coffee-raw",
    companyId: "comp-james-holdings",
    sku: "AGR-COF-PRM",
    name: "Arabica Coffee Beans (Premium Grade A)",
    category: "Agribusiness Products",
    barcode: "690123456789",
    qrCode: "QR-AGR-COF-PRM",
    description: "Export-quality hand-sorted Arabica coffee beans harvested from Yirgacheffe highlands.",
    price: 380, // ETB per KG
    cost: 210,
    stock: {
      "wh-addis-main": 15000,
      "wh-adama-dist": 5000,
    },
    reorderPoint: 2500,
  },
  {
    id: "prod-teff-white",
    companyId: "comp-james-holdings",
    sku: "AGR-TEF-WHT",
    name: "Magna Teff Flour (Super White 50kg)",
    category: "Agribusiness Products",
    barcode: "690123456712",
    qrCode: "QR-AGR-TEF-WHT",
    description: "Premium stone-ground white magna teff, organic and gluten-free.",
    price: 4500, // ETB per 50kg bag
    cost: 3100,
    stock: {
      "wh-addis-main": 4000,
      "wh-adama-dist": 3000,
    },
    reorderPoint: 1000,
  },
  {
    id: "prod-pump-solar",
    companyId: "comp-james-holdings",
    sku: "TEC-SOL-PMP",
    name: "Solar Water Pump System (120W DC)",
    category: "Renewable Energy Equipment",
    barcode: "840156900112",
    qrCode: "QR-TEC-SOL-PMP",
    description: "High-efficiency brushless submersible solar water pump for modern smart farming irrigation.",
    price: 24500,
    cost: 16800,
    stock: {
      "wh-addis-main": 150,
      "wh-adama-dist": 80,
    },
    reorderPoint: 20,
  },
  {
    id: "prod-box-pack",
    companyId: "comp-hawassa-agro",
    sku: "PKG-BOX-IND",
    name: "Corrugated Industrial Packing Box (Heavy Duty)",
    category: "Packaging Materials",
    barcode: "750188904509",
    qrCode: "QR-PKG-BOX-IND",
    description: "Eco-friendly heavy-duty double-wall corrugated cardboard box for regional distribution cargo.",
    price: 65,
    cost: 38,
    stock: {
      "wh-hawassa-cold": 45000,
    },
    reorderPoint: 5000,
  },
];

export const initialSuppliers: Supplier[] = [
  {
    id: "sup-yirgacheffe-union",
    companyId: "comp-james-holdings",
    name: "Yirgacheffe Coffee Farmers Cooperative Union",
    contactPerson: "Ato Tadesse Gebre",
    phone: "+251462201122",
    email: "info@yirgacheffeunion.com",
    tin: "0045127896",
    address: "Dilla, Gedeo Zone, SNNPR, Ethiopia",
  },
  {
    id: "sup-abyssinia-trading",
    companyId: "comp-james-holdings",
    name: "Abyssinia Agri-Tech Trading PLC",
    contactPerson: "W/ro Martha Kassa",
    phone: "+251115518900",
    email: "sales@abyssiniatrading.com",
    tin: "0052341109",
    address: "Saris, Kera Industrial Area, Addis Ababa",
  },
];

export const initialCustomers: Customer[] = [
  {
    id: "cust-hilton-addis",
    companyId: "comp-james-holdings",
    name: "Hilton Addis Ababa",
    contactPerson: "Chef Daniel Jenkins",
    phone: "+251115170000",
    email: "daniel.jenkins@hiltonaddis.com",
    tin: "0022441166",
    address: "Menelik II Avenue, Addis Ababa, Ethiopia",
  },
  {
    id: "cust-ethiopian-airlines",
    companyId: "comp-james-holdings",
    name: "Ethiopian Airlines Catering Division",
    contactPerson: "W/ro Tsige Hailu",
    phone: "+251116179922",
    email: "tsigeh@ethiopianairlines.com",
    tin: "0011559988",
    address: "Bole International Airport Complex, Addis Ababa",
  },
];

export const initialLeads: Lead[] = [
  {
    id: "lead-1",
    companyId: "comp-james-holdings",
    name: "Fana Coffee Roasters PLC",
    company: "Fana Roasters Group",
    email: "procurement@fanaroasters.com",
    phone: "+251911889900",
    status: "Qualified",
    source: "Social Media",
    assignedToId: "emp-almaz-sales",
    assignedToName: "Almaz Tesfaye",
  },
  {
    id: "lead-2",
    companyId: "comp-james-holdings",
    name: "Rift Valley Agriculture Development",
    company: "Rift Valley Corp",
    email: "tariku@riftvalleyagri.com",
    phone: "+251920334455",
    status: "New",
    source: "Web",
    assignedToId: "emp-almaz-sales",
    assignedToName: "Almaz Tesfaye",
  },
];

export const initialSalesOrders: SalesOrder[] = [
  {
    id: "so-2026-001",
    companyId: "comp-james-holdings",
    branchId: "branch-addis-hq",
    customerId: "cust-hilton-addis",
    customerName: "Hilton Addis Ababa",
    date: "2026-07-05",
    items: [
      { productId: "prod-coffee-raw", productName: "Arabica Coffee Beans (Premium Grade A)", quantity: 500, unitPrice: 380, total: 190000 },
      { productId: "prod-teff-white", productName: "Magna Teff Flour (Super White 50kg)", quantity: 20, unitPrice: 4500, total: 90000 },
    ],
    totalAmount: 280000,
    status: "Paid",
    shippingAddress: "Hilton Addis Main Store Room, Menelik II Avenue",
  },
  {
    id: "so-2026-002",
    companyId: "comp-james-holdings",
    branchId: "branch-addis-hq",
    customerId: "cust-ethiopian-airlines",
    customerName: "Ethiopian Airlines Catering Division",
    date: "2026-07-09",
    items: [
      { productId: "prod-teff-white", productName: "Magna Teff Flour (Super White 50kg)", quantity: 150, unitPrice: 4500, total: 675000 },
    ],
    totalAmount: 675000,
    status: "Shipped",
    shippingAddress: "Catering Cargo Terminal Gate 4, Bole Airport",
  },
];

export const initialPurchaseOrders: PurchaseOrder[] = [
  {
    id: "po-2026-001",
    companyId: "comp-james-holdings",
    supplierId: "sup-yirgacheffe-union",
    supplierName: "Yirgacheffe Coffee Farmers Cooperative Union",
    date: "2026-07-01",
    items: [
      { productId: "prod-coffee-raw", productName: "Arabica Coffee Beans (Premium Grade A)", quantity: 10000, unitPrice: 210, total: 2100000 },
    ],
    totalAmount: 2100000,
    status: "Paid",
  },
  {
    id: "po-2026-002",
    companyId: "comp-james-holdings",
    supplierId: "sup-abyssinia-trading",
    supplierName: "Abyssinia Agri-Tech Trading PLC",
    date: "2026-07-08",
    items: [
      { productId: "prod-pump-solar", productName: "Solar Water Pump System (120W DC)", quantity: 50, unitPrice: 16800, total: 840000 },
    ],
    totalAmount: 840000,
    status: "Ordered",
  },
];

export const initialProjects: Project[] = [
  {
    id: "proj-1",
    companyId: "comp-james-holdings",
    name: "Adama Depot Solar Modernization",
    description: "Installing clean smart-grid active solar generation arrays to feed cooling chillers fully.",
    startDate: "2026-06-01",
    endDate: "2026-10-30",
    status: "In Progress",
    managerId: "emp-james-ceo",
    managerName: "James Kebede",
    budget: 1250000,
    milestones: [
      { id: "m-1", title: "Civil Site Prep & Frame Foundation", dueDate: "2026-07-15", status: "Completed" },
      { id: "m-2", title: "Smart Sub-station Integration", dueDate: "2026-08-30", status: "Pending" },
      { id: "m-3", title: "Live Chiller Testing", dueDate: "2026-10-15", status: "Pending" },
    ],
  },
  {
    id: "proj-2",
    companyId: "comp-james-holdings",
    name: "Magna Teff Regional Sourcing Hub",
    description: "Setting up collaborative collection centers near Gojjam and Shoa to cut supply-chain costs.",
    startDate: "2026-08-01",
    endDate: "2027-02-15",
    status: "Planning",
    managerId: "emp-chala-inventory",
    managerName: "Chala Bekele",
    budget: 780000,
    milestones: [],
  },
];

export const initialTasks: Task[] = [
  {
    id: "task-1",
    projectId: "proj-1",
    projectName: "Adama Depot Solar Modernization",
    title: "Configure Solar Panel Frame Brackets",
    description: "Assemble and torque down galvanized aluminum mounting brackets on roof structures.",
    assigneeId: "emp-chala-inventory",
    assigneeName: "Chala Bekele",
    startDate: "2026-06-15",
    dueDate: "2026-07-12",
    status: "Review",
    priority: "High",
    timeSpentMinutes: 720,
  },
  {
    id: "task-2",
    projectId: "proj-1",
    projectName: "Adama Depot Solar Modernization",
    title: "Procure SUB-100 Inverter Modules",
    description: "Confirm invoice delivery details from suppliers and log customs clearances.",
    assigneeId: "emp-yohannes-acc",
    assigneeName: "Yohannes Demissie",
    startDate: "2026-07-02",
    dueDate: "2026-07-20",
    status: "In Progress",
    priority: "Medium",
    timeSpentMinutes: 180,
  },
];

export const initialAssets: Asset[] = [
  {
    id: "asset-1",
    companyId: "comp-james-holdings",
    branchId: "branch-addis-hq",
    name: "Addis HQ Server Stack Control Tower",
    category: "IT Equipment",
    cost: 450000,
    acquisitionDate: "2024-03-12",
    salvageValue: 50000,
    usefulLifeYears: 5,
    accumulatedDepreciation: 180000,
    assignedToId: "emp-james-ceo",
    assignedToName: "James Kebede",
    maintenanceSchedule: {
      lastMaintenanceDate: "2026-05-15",
      nextMaintenanceDate: "2026-11-15",
      intervalMonths: 6,
      notes: "Blow out physical dust filters and execute backup sector checks.",
    },
  },
  {
    id: "asset-2",
    companyId: "comp-james-holdings",
    branchId: "branch-adama",
    name: "Isuzu NPR Logistics Delivery Truck",
    category: "Vehicles",
    cost: 2300000,
    acquisitionDate: "2023-01-10",
    salvageValue: 300000,
    usefulLifeYears: 8,
    accumulatedDepreciation: 750000,
    assignedToId: "emp-chala-inventory",
    assignedToName: "Chala Bekele",
    maintenanceSchedule: {
      lastMaintenanceDate: "2026-06-01",
      nextMaintenanceDate: "2026-10-01",
      intervalMonths: 4,
      notes: "Engine oil, hydraulic fluid levels, and brake pad inspections.",
    },
  },
];

export const initialTickets: Ticket[] = [
  {
    id: "tick-001",
    companyId: "comp-james-holdings",
    customerName: "Chef Daniel Jenkins (Hilton)",
    subject: "Arabic Grade A Shipment Discrepancy",
    description: "Our cargo arrived but 2 bags of beans appear slightly damp at base. Requesting immediate replacement sorting.",
    category: "Technical",
    priority: "High",
    status: "In Progress",
    createdAt: "2026-07-10T14:35:00Z",
    assignedToId: "emp-almaz-sales",
    assignedToName: "Almaz Tesfaye",
    chatLog: [
      { id: "m1", senderName: "Chef Daniel Jenkins (Hilton)", senderRole: "Customer", message: "Hi, we opened our shipment of Grade A Coffee and noticed 2 bags look like they suffered moisture during truck cargo transit.", timestamp: "2026-07-10T14:35:00Z" },
      { id: "m2", senderName: "James ERP Bot", senderRole: "AI Bot", message: "Hello! I am James ERP Bot. I have automatically flagged this ticket as High priority and routed it to our Logistics and Sales representative Almaz Tesfaye. We apologize for the inconvenience and will solve this quickly.", timestamp: "2026-07-10T14:36:12Z" },
    ],
  },
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: "log-1",
    companyId: "comp-james-holdings",
    userId: "emp-james-ceo",
    userName: "James Kebede",
    userRole: UserRole.CEO,
    action: "Login",
    details: "User successfully authenticated via ERP terminal secure session.",
    ipAddress: "197.156.75.122",
    timestamp: "2026-07-11T09:00:15Z",
  },
  {
    id: "log-2",
    companyId: "comp-james-holdings",
    userId: "emp-yohannes-acc",
    userName: "Yohannes Demissie",
    userRole: UserRole.ACCOUNTANT,
    action: "Post Journal Entry",
    details: "Posted Journal Entry (id: JE-2026-012) amounting to 280,000 ETB.",
    ipAddress: "197.156.75.105",
    timestamp: "2026-07-11T11:45:00Z",
  },
];

export const initialNotifications: Notification[] = [
  {
    id: "not-1",
    userId: "emp-james-ceo",
    title: "Low Stock Alert: Magna Teff Flour",
    content: "Magna Teff stock at Adama Distribution Hub fell below reorder point. Current stock is 3000.",
    type: "In-App",
    category: "Inventory",
    status: "Unread",
    timestamp: "2026-07-11T12:00:00Z",
  },
  {
    id: "not-2",
    userId: "emp-james-ceo",
    title: "Journal Entry Created",
    content: "Accountant Yohannes Demissie created journal entry JE-2026-012.",
    type: "In-App",
    category: "Finance",
    status: "Unread",
    timestamp: "2026-07-11T11:46:00Z",
  },
];

export const initialJournalEntries: JournalEntry[] = [
  {
    id: "je-2026-012",
    companyId: "comp-james-holdings",
    branchId: "branch-addis-hq",
    date: "2026-07-11",
    description: "Settle office rental lease invoice for Bole Head Office Building.",
    reference: "REF-LEASE-2026",
    items: [
      { accountId: "coa-rent", accountName: "Rent & Facilities Expense", debit: 85000, credit: 0 },
      { accountId: "coa-cash", accountName: "Cash in Bank (CBE Birr/Telebirr)", debit: 0, credit: 85000 },
    ],
    status: "Posted",
  },
  {
    id: "je-2026-013",
    companyId: "comp-james-holdings",
    branchId: "branch-addis-hq",
    date: "2026-07-12",
    description: "Purchase of high-speed office networking cables and routers.",
    reference: "REF-NET-889",
    items: [
      { accountId: "coa-equip", accountName: "Machinery & Equipment", debit: 24500, credit: 0 },
      { accountId: "coa-cash", accountName: "Cash in Bank (CBE Birr/Telebirr)", debit: 0, credit: 24500 },
    ],
    status: "Draft",
  },
];

/**
 * Helper to convert Gregorian calendar dates to Ethiopian Calendar (EC) approximations.
 * Ethiopian year is 7 or 8 years behind Gregorian calendar.
 * Meskerem (Month 1) starts Sept 11 or 12.
 */
export function getEthiopianCalendarDate(gregorianDateStr: string): string {
  try {
    const d = new Date(gregorianDateStr);
    if (isNaN(d.getTime())) return "Pagumen 5, 2018 E.C.";
    
    const yr = d.getFullYear();
    const m = d.getMonth() + 1;
    const day = d.getDate();
    
    // Simple offset mapping for Ethiopian Calendar (E.C.)
    let ecYear = yr - 8;
    // Meskerem 1 is Sept 11/12
    const isLeap = (yr % 4 === 0);
    const newYearDate = isLeap ? 12 : 11;
    
    if (m > 9 || (m === 9 && day >= newYearDate)) {
      ecYear = yr - 7;
    }
    
    // Simple rough month conversions
    const months = [
      "Meskerem", "Tekemt", "Hedar", "Tahsas", "Ter", "Yekatit",
      "Megabit", "Miazia", "Genbot", "Sene", "Hamle", "Nehase", "Pagumen"
    ];
    
    // Very simple lookup mapping for demonstration
    let monthIdx = 0;
    let ecDay = day;
    
    if (m === 9) { // Sept
      if (day < newYearDate) {
        monthIdx = 12; // Pagumen
        ecDay = day + (isLeap ? 6 : 5) - newYearDate + 1;
      } else {
        monthIdx = 0; // Meskerem
        ecDay = day - newYearDate + 1;
      }
    } else if (m === 10) { // Oct
      monthIdx = day < 11 ? 0 : 1; // Meskerem or Tekemt
      ecDay = day < 11 ? day + 20 : day - 10;
    } else if (m === 11) { // Nov
      monthIdx = day < 10 ? 1 : 2; // Tekemt or Hedar
      ecDay = day < 10 ? day + 21 : day - 9;
    } else if (m === 12) { // Dec
      monthIdx = day < 10 ? 2 : 3; // Hedar or Tahsas
      ecDay = day < 10 ? day + 21 : day - 9;
    } else if (m === 1) { // Jan
      monthIdx = day < 9 ? 3 : 4; // Tahsas or Ter
      ecDay = day < 9 ? day + 22 : day - 8;
    } else if (m === 2) { // Feb
      monthIdx = day < 8 ? 4 : 5; // Ter or Yekatit
      ecDay = day < 8 ? day + 23 : day - 7;
    } else if (m === 3) { // Mar
      monthIdx = day < 10 ? 5 : 6; // Yekatit or Megabit
      ecDay = day < 10 ? day + 21 : day - 9;
    } else if (m === 4) { // Apr
      monthIdx = day < 9 ? 6 : 7; // Megabit or Miazia
      ecDay = day < 9 ? day + 22 : day - 8;
    } else if (m === 5) { // May
      monthIdx = day < 9 ? 7 : 8; // Miazia or Genbot
      ecDay = day < 9 ? day + 22 : day - 8;
    } else if (m === 6) { // Jun
      monthIdx = day < 8 ? 8 : 9; // Genbot or Sene
      ecDay = day < 8 ? day + 23 : day - 7;
    } else if (m === 7) { // Jul
      monthIdx = day < 8 ? 9 : 10; // Sene or Hamle
      ecDay = day < 8 ? day + 23 : day - 7;
    } else if (m === 8) { // Aug
      monthIdx = day < 7 ? 10 : 11; // Hamle or Nehase
      ecDay = day < 7 ? day + 24 : day - 6;
    }
    
    return `${months[monthIdx]} ${ecDay}, ${ecYear} E.C.`;
  } catch (err) {
    return "Meskerem 1, 2018 E.C.";
  }
}
