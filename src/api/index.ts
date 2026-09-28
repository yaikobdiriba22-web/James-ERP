import express, { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { GoogleGenAI } from "@google/genai";

import { prisma } from "../src/db/prisma";

import {
  UserRole,
  Employee,
  ChartOfAccount,
  Product,
  Lead,
  SalesOrder,
  PurchaseOrder,
  Project,
  Task,
  Ticket,
  AuditLog,
  Notification,
  JournalEntry,
} from "../types";

import {
  initialCompanies,
  initialBranches,
  initialWarehouses,
  initialDepartments,
  initialEmployees,
  initialChartOfAccounts,
  initialProducts,
  initialSuppliers,
  initialCustomers,
  initialLeads,
  initialSalesOrders,
  initialPurchaseOrders,
  initialProjects,
  initialTasks,
  initialAssets,
  initialTickets,
  initialAuditLogs,
  initialNotifications,
  initialJournalEntries,
} from "../db/initialData";

const DB_FILE = path.join(process.cwd(), "src", "db", "erp_db.json");

interface ERPDatabase {
  companies: typeof initialCompanies;
  branches: typeof initialBranches;
  warehouses: typeof initialWarehouses;
  departments: typeof initialDepartments;
  employees: Employee[];
  chartOfAccounts: ChartOfAccount[];
  products: Product[];
  suppliers: typeof initialSuppliers;
  customers: typeof initialCustomers;
  leads: Lead[];
  salesOrders: SalesOrder[];
  purchaseOrders: PurchaseOrder[];
  projects: Project[];
  tasks: Task[];
  assets: typeof initialAssets;
  tickets: Ticket[];
  auditLogs: AuditLog[];
  notifications: Notification[];
  journalEntries: JournalEntry[];
  sessions: { token: string; userId: string; expiry: number }[];
}

let dbState: ERPDatabase = {
  companies: initialCompanies,
  branches: initialBranches,
  warehouses: initialWarehouses,
  departments: initialDepartments,
  employees: initialEmployees,
  chartOfAccounts: initialChartOfAccounts,
  products: initialProducts,
  suppliers: initialSuppliers,
  customers: initialCustomers,
  leads: initialLeads,
  salesOrders: initialSalesOrders,
  purchaseOrders: initialPurchaseOrders,
  projects: initialProjects,
  tasks: initialTasks,
  assets: initialAssets,
  tickets: initialTickets,
  auditLogs: initialAuditLogs,
  notifications: initialNotifications,
  journalEntries: initialJournalEntries,
  sessions: [],
};

async function loadDatabase() {
  if (!process.env.DATABASE_URL) {
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const content = fs.readFileSync(DB_FILE, "utf-8");
        dbState = JSON.parse(content);
        console.log("James ERP database loaded successfully from local storage.");
      } else {
        saveDatabase();
        console.log("James ERP database initialized with seeded corporate data.");
      }
    } catch (error) {
      console.error("Failed to load ERP database from local storage:", error);
    }
    return;
  }

  try {
    const row = await prisma.erpState.findUnique({ where: { id: "default" } });
    if (row && row.data && typeof row.data === "object") {
      dbState = row.data as ERPDatabase;
      console.log("James ERP database loaded successfully from PostgreSQL.");
      return;
    }

    await saveDatabase();
    console.log("James ERP database initialized with seeded corporate data in PostgreSQL.");
  } catch (error) {
    console.error("Failed to load ERP database from PostgreSQL:", error);
  }
}

async function saveDatabase() {
  if (!process.env.DATABASE_URL) {
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(dbState, null, 2), "utf-8");
    } catch (error) {
      console.error("Failed to save ERP database to local storage:", error);
    }
    return;
  }

  try {
    await prisma.erpState.upsert({
      where: { id: "default" },
      update: {
        data: dbState,
        version: { increment: 1 },
      },
      create: {
        id: "default",
        data: dbState,
        version: 1,
      },
    });
  } catch (error) {
    console.error("Failed to save ERP database to PostgreSQL:", error);
  }
}

const databaseReady = loadDatabase();

const geminiApiKey = process.env.GEMINI_API_KEY || "";
let ai: GoogleGenAI | null = null;
if (geminiApiKey) {
  ai = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
  console.log("Google Gemini client initialized for James ERP AI module.");
} else {
  console.warn("GEMINI_API_KEY missing. AI features will operate in local fallback mode.");
}

function logActivity(companyId: string, userId: string, userName: string, role: UserRole, action: string, details: string, req: Request) {
  const newLog: AuditLog = {
    id: `log-${crypto.randomBytes(4).toString("hex")}`,
    companyId,
    userId,
    userName,
    userRole: role,
    action,
    details,
    ipAddress: req.ip || "127.0.0.1",
    timestamp: new Date().toISOString(),
  };
  dbState.auditLogs.unshift(newLog);

  const newNot: Notification = {
    id: `not-${crypto.randomBytes(4).toString("hex")}`,
    userId,
    title: action,
    content: details,
    type: "In-App",
    category: "System",
    status: "Unread",
    timestamp: new Date().toISOString(),
  };
  dbState.notifications.unshift(newNot);
  void saveDatabase();
}

export function createApiRouter() {
  const app = express();
  app.use(express.json());

  app.use(async (_req: Request, _res: Response, next: NextFunction) => {
    try {
      await databaseReady;
      next();
    } catch (error) {
      next(error);
    }
  });

  app.use((req: Request, res: Response, next: NextFunction) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
      return;
    }
    next();
  });

  const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      res.status(401).json({ error: "Access token missing" });
      return;
    }

    const session = dbState.sessions.find((s) => s.token === token);
    if (!session || session.expiry < Date.now()) {
      res.status(403).json({ error: "Token expired or invalid" });
      return;
    }

    const employee = dbState.employees.find((e) => e.id === session.userId);
    if (!employee) {
      res.status(403).json({ error: "User not found" });
      return;
    }

    (req as any).user = employee;
    next();
  };

  app.post("/api/auth/login", (req: Request, res: Response) => {
    const { email, password } = req.body;

    let emailToFind = (email || "").toLowerCase();
    if (emailToFind === "accountant@jameserp.com") {
      emailToFind = "accounting@jameserp.com";
    }
    const employee = dbState.employees.find((e) => e.email.toLowerCase() === emailToFind);

    if (!employee) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = crypto.randomBytes(32).toString("hex");
    dbState.sessions.push({
      token,
      userId: employee.id,
      expiry: Date.now() + 24 * 60 * 60 * 1000,
    });

    logActivity(
      employee.companyId,
      employee.id,
      employee.name,
      employee.role,
      "User Login",
      `Employee ${employee.name} logged into James ERP.`,
      req
    );

    res.json({
      token,
      user: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        companyId: employee.companyId,
        branchId: employee.branchId,
        phone: employee.phone,
        status: "Active",
      },
    });
  });

  app.post("/api/auth/register", (req: Request, res: Response) => {
    const { name, email, role, companyId, branchId, phone, departmentId } = req.body;

    if (!name || !email || !role) {
      res.status(400).json({ error: "Required fields missing" });
      return;
    }

    const existing = dbState.employees.find((e) => e.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      res.status(400).json({ error: "Email already registered" });
      return;
    }

    const newEmp: Employee = {
      id: `emp-${crypto.randomBytes(4).toString("hex")}`,
      name,
      email,
      phone: phone || "+251900000000",
      role: role as UserRole,
      departmentId: departmentId || "dept-sales",
      branchId: branchId || "branch-addis-hq",
      companyId: companyId || "comp-james-holdings",
      hireDate: new Date().toISOString().split("T")[0],
      salary: 30000,
      status: "Active",
      attendance: [],
      leaves: [],
      performance: [],
      training: [],
    } as any;

    dbState.employees.push(newEmp);
    void saveDatabase();

    res.json({ message: "Registration successful. Please login.", user: newEmp });
  });

  app.get("/api/auth/profile", authenticateToken, (req: Request, res: Response) => {
    res.json({ user: (req as any).user });
  });

  app.get("/api/erp/me", authenticateToken, (req: Request, res: Response) => {
    res.json({ user: (req as any).user });
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token) {
      dbState.sessions = dbState.sessions.filter((s) => s.token !== token);
      void saveDatabase();
    }
    res.json({ success: true });
  });

  app.get("/api/erp/data", authenticateToken, (req: Request, res: Response) => {
    res.json(dbState);
  });

  app.post("/api/erp/notifications/read", authenticateToken, (req: Request, res: Response) => {
    const { id } = req.body;
    const notif = dbState.notifications.find((n) => n.id === id);
    if (notif) {
      notif.status = "Read";
      void saveDatabase();
    }
    res.json({ success: true });
  });

  app.post("/api/erp/hr/attendance", authenticateToken, (req: Request, res: Response) => {
    const { employeeId, checkIn, checkOut, date, status } = req.body;
    const empIndex = dbState.employees.findIndex((e) => e.id === employeeId);

    if (empIndex === -1) {
      res.status(404).json({ error: "Employee not found" });
      return;
    }

    const employee = dbState.employees[empIndex];
    const newRecord = {
      id: `att-${crypto.randomBytes(4).toString("hex")}`,
      employeeId,
      date: date || new Date().toISOString().split("T")[0],
      checkIn: checkIn || "08:30",
      checkOut,
      status: (status || "Present") as any,
    };

    employee.attendance.push(newRecord);
    void saveDatabase();

    logActivity(
      employee.companyId,
      (req as any).user.id,
      (req as any).user.name,
      (req as any).user.role,
      "Log Attendance",
      `Logged attendance for ${employee.name} on ${newRecord.date}.`,
      req
    );

    res.json({ success: true, record: newRecord });
  });

  app.post("/api/erp/hr/leaves", authenticateToken, (req: Request, res: Response) => {
    const { employeeId, leaveType, startDate, endDate, days, reason } = req.body;
    const empIndex = dbState.employees.findIndex((e) => e.id === employeeId);

    if (empIndex === -1) {
      res.status(404).json({ error: "Employee not found" });
      return;
    }

    const employee = dbState.employees[empIndex];
    const newLeave = {
      id: `leave-${crypto.randomBytes(4).toString("hex")}`,
      employeeId,
      leaveType: leaveType || "Annual",
      startDate,
      endDate,
      days: parseInt(days) || 1,
      reason,
      status: "Pending" as const,
    };

    employee.leaves.unshift(newLeave);
    void saveDatabase();

    logActivity(
      employee.companyId,
      (req as any).user.id,
      (req as any).user.name,
      (req as any).user.role,
      "Submit Leave",
      `Submitted leave request for ${employee.name} starting ${startDate}.`,
      req
    );

    res.json({ success: true, leave: newLeave });
  });

  app.post("/api/erp/hr/leaves/approve", authenticateToken, (req: Request, res: Response) => {
    const { employeeId, leaveId, status } = req.body;
    const empIndex = dbState.employees.findIndex((e) => e.id === employeeId);

    if (empIndex === -1) {
      res.status(404).json({ error: "Employee not found" });
      return;
    }

    const employee = dbState.employees[empIndex];
    const leave = employee.leaves.find((l) => l.id === leaveId);

    if (!leave) {
      res.status(404).json({ error: "Leave record not found" });
      return;
    }

    leave.status = status;
    if (status === "Approved") {
      employee.status = "On Leave";
    } else {
      employee.status = "Active";
    }

    void saveDatabase();

    logActivity(
      employee.companyId,
      (req as any).user.id,
      (req as any).user.name,
      (req as any).user.role,
      "Process Leave",
      `HR updated leave (id: ${leaveId}) for ${employee.name} to ${status}.`,
      req
    );

    res.json({ success: true, leave });
  });

  app.post("/api/erp/finance/journal", authenticateToken, (req: Request, res: Response) => {
    const { description, reference, date, items } = req.body;
    const user = (req as any).user;

    if (!items || items.length === 0) {
      res.status(400).json({ error: "Journal items missing" });
      return;
    }

    let totalDebit = 0;
    let totalCredit = 0;
    items.forEach((item: any) => {
      totalDebit += parseFloat(item.debit) || 0;
      totalCredit += parseFloat(item.credit) || 0;
    });

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      res.status(400).json({ error: `Unbalanced journal entry! Debits (${totalDebit}) must equal Credits (${totalCredit}).` });
      return;
    }

    const newJE: JournalEntry = {
      id: `je-${crypto.randomBytes(4).toString("hex")}`,
      companyId: user.companyId,
      branchId: user.branchId,
      date: date || new Date().toISOString().split("T")[0],
      description,
      reference,
      items,
      status: "Posted",
    } as any;

    items.forEach((item: any) => {
      const coa = dbState.chartOfAccounts.find((c) => c.id === item.accountId);
      if (coa) {
        const debitAmt = parseFloat(item.debit) || 0;
        const creditAmt = parseFloat(item.credit) || 0;

        if (coa.category === "Asset" || coa.category === "Expense") {
          coa.balance += (debitAmt - creditAmt);
        } else {
          coa.balance += (creditAmt - debitAmt);
        }
      }
    });

    dbState.journalEntries.unshift(newJE);
    void saveDatabase();

    logActivity(
      user.companyId,
      user.id,
      user.name,
      user.role,
      "Post Journal Entry",
      `Journal Entry posted: ${description}. Total amount: ${totalDebit} ETB.`,
      req
    );

    res.json({ success: true, journalEntry: newJE });
  });

  app.post("/api/erp/inventory/product", authenticateToken, (req: Request, res: Response) => {
    const { name, sku, category, price, cost, description, initialStock, warehouseId, reorderPoint } = req.body;
    const user = (req as any).user;

    if (!name || !sku || !price) {
      res.status(400).json({ error: "Required fields missing" });
      return;
    }

    const barcode = crypto.randomBytes(6).readUIntBE(0, 6).toString().padStart(12, "0");
    const qrCode = `QR-${sku}`;

    const newProd: Product = {
      id: `prod-${crypto.randomBytes(4).toString("hex")}`,
      companyId: user.companyId,
      sku,
      name,
      category: category || "General Products",
      barcode,
      qrCode,
      description,
      price: parseFloat(price),
      cost: parseFloat(cost) || 0,
      stock: {
        [warehouseId || "wh-addis-main"]: parseInt(initialStock) || 0,
      },
      reorderPoint: parseInt(reorderPoint) || 10,
    } as any;

    dbState.products.push(newProd);
    void saveDatabase();

    logActivity(
      user.companyId,
      user.id,
      user.name,
      user.role,
      "Create Product",
      `Created product catalog for ${name} (SKU: ${sku}).`,
      req
    );

    res.json({ success: true, product: newProd });
  });

  app.post("/api/erp/inventory/adjust", authenticateToken, (req: Request, res: Response) => {
    const { productId, warehouseId, quantity, reason } = req.body;
    const user = (req as any).user;

    const product = dbState.products.find((p) => p.id === productId);
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    const adjQty = parseInt(quantity) || 0;
    const currentStock = product.stock[warehouseId] || 0;
    product.stock[warehouseId] = Math.max(0, currentStock + adjQty);

    void saveDatabase();

    logActivity(
      user.companyId,
      user.id,
      user.name,
      user.role,
      "Adjust Stock",
      `Adjusted product ${product.name} at warehouse ${warehouseId} by ${adjQty}. Reason: ${reason}`,
      req
    );

    res.json({ success: true, product });
  });

  app.post("/api/erp/sales/order", authenticateToken, (req: Request, res: Response) => {
    const { customerId, items, shippingAddress, gateway } = req.body;
    const user = (req as any).user;

    if (!customerId || !items || items.length === 0) {
      res.status(400).json({ error: "Order requirements missing" });
      return;
    }

    const customer = dbState.customers.find((c) => c.id === customerId);
    if (!customer) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }

    let totalAmount = 0;
    const resolvedItems = items.map((item: any) => {
      const prod = dbState.products.find((p) => p.id === item.productId);
      const price = prod ? prod.price : item.unitPrice;
      const total = price * item.quantity;
      totalAmount += total;

      if (prod) {
        const whId = "wh-addis-main";
        if (prod.stock[whId]) {
          prod.stock[whId] = Math.max(0, prod.stock[whId] - item.quantity);
        }
      }

      return {
        productId: item.productId,
        productName: prod ? prod.name : "Custom Item",
        quantity: item.quantity,
        unitPrice: price,
        total,
      };
    });

    const newSO: SalesOrder = {
      id: `so-2026-${crypto.randomBytes(2).toString("hex").toUpperCase()}`,
      companyId: user.companyId,
      branchId: user.branchId,
      customerId,
      customerName: customer.name,
      date: new Date().toISOString().split("T")[0],
      items: resolvedItems,
      totalAmount,
      status: gateway ? "Paid" : "Confirmed",
      shippingAddress: shippingAddress || customer.address,
    } as any;

    const arAcc = dbState.chartOfAccounts.find((c) => c.code === "1200");
    const revAcc = dbState.chartOfAccounts.find((c) => c.code === "4000");
    if (arAcc) arAcc.balance += totalAmount;
    if (revAcc) revAcc.balance += totalAmount;

    dbState.salesOrders.unshift(newSO);
    void saveDatabase();

    logActivity(
      user.companyId,
      user.id,
      user.name,
      user.role,
      "Confirm Sales Order",
      `Created Sales Order ${newSO.id} for ${customer.name}. Gateway used: ${gateway || "Net terms"}. Total: ${totalAmount} ETB.`,
      req
    );

    res.json({ success: true, salesOrder: newSO });
  });

  app.post("/api/erp/sales/leads", authenticateToken, (req: Request, res: Response) => {
    const { name, company, email, phone, source } = req.body;
    const user = (req as any).user;

    const newLead: Lead = {
      id: `lead-${crypto.randomBytes(4).toString("hex")}`,
      companyId: user.companyId,
      name,
      company,
      email,
      phone,
      status: "New",
      source: source || "Web",
      assignedToId: user.id,
      assignedToName: user.name,
    } as any;

    dbState.leads.unshift(newLead);
    void saveDatabase();

    res.json({ success: true, lead: newLead });
  });

  app.post("/api/erp/projects/task", authenticateToken, (req: Request, res: Response) => {
    const { projectId, title, description, assigneeId, dueDate, priority } = req.body;
    const user = (req as any).user;

    const project = dbState.projects.find((p) => p.id === projectId);
    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    const assignee = dbState.employees.find((e) => e.id === assigneeId) || user;

    const newTask: Task = {
      id: `task-${crypto.randomBytes(4).toString("hex")}`,
      projectId,
      projectName: project.name,
      title,
      description,
      assigneeId: assignee.id,
      assigneeName: assignee.name,
      startDate: new Date().toISOString().split("T")[0],
      dueDate,
      status: "Todo",
      priority: priority || "Medium",
      timeSpentMinutes: 0,
    } as any;

    dbState.tasks.push(newTask);
    void saveDatabase();

    logActivity(
      user.companyId,
      user.id,
      user.name,
      user.role,
      "Create Task",
      `Assigned task "${title}" to ${assignee.name} under project "${project.name}".`,
      req
    );

    res.json({ success: true, task: newTask });
  });

  app.post("/api/erp/projects/task/status", authenticateToken, (req: Request, res: Response) => {
    const { taskId, status, timeSpent } = req.body;

    const task = dbState.tasks.find((t) => t.id === taskId);
    if (!task) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    task.status = status;
    if (timeSpent) {
      task.timeSpentMinutes += parseInt(timeSpent);
    }
    void saveDatabase();

    res.json({ success: true, task });
  });

  app.post("/api/erp/tickets/message", authenticateToken, (req: Request, res: Response) => {
    const { ticketId, message } = req.body;
    const user = (req as any).user;

    const ticket = dbState.tickets.find((t) => t.id === ticketId);
    if (!ticket) {
      res.status(404).json({ error: "Ticket not found" });
      return;
    }

    const userMsg = {
      id: `msg-${crypto.randomBytes(4).toString("hex")}`,
      senderName: user.name,
      senderRole: "Support Agent" as const,
      message,
      timestamp: new Date().toISOString(),
    };

    ticket.chatLog.push(userMsg);
    ticket.status = "In Progress";
    void saveDatabase();

    if (ai) {
      setTimeout(async () => {
        try {
          const contents = `
            You are "James ERP Assistant", a helpful, empathetic support co-pilot.
            A customer (${ticket.customerName}) raised a ticket regarding: "${ticket.subject}" (${ticket.description}).
            The support agent (${user.name}) just sent: "${message}".
            Generate a helpful, formal, enterprise-grade response that our AI support helper can post to assist both the agent and customer. Keep it short (2-3 sentences max).
          `;
          const response = await ai!.models.generateContent({
            model: "gemini-3.5-flash",
            contents,
          });

          const aiReply = response.text || "I have logged this requirement and our dispatch operations will verify the packing condition immediately.";

          const aiMsg = {
            id: `msg-${crypto.randomBytes(4).toString("hex")}`,
            senderName: "James ERP Bot",
            senderRole: "AI Bot" as const,
            message: aiReply.trim(),
            timestamp: new Date().toISOString(),
          };

          const freshTicket = dbState.tickets.find((t) => t.id === ticketId);
          if (freshTicket) {
            freshTicket.chatLog.push(aiMsg);
            void saveDatabase();
          }
        } catch (e) {
          console.error("AI help desk responder error:", e);
        }
      }, 1500);
    }

    res.json({ success: true, ticket });
  });

  app.post("/api/gemini/chat", authenticateToken, async (req: Request, res: Response) => {
    const { prompt, history } = req.body;

    if (!prompt) {
      res.status(400).json({ error: "Prompt is required" });
      return;
    }

    if (!ai) {
      res.json({
        text: `[FALLBACK MODE - GEMINI_API_KEY is not defined in system secrets]
James ERP AI Engine parsed your query: "${prompt}".
Here is a simulated response based on active ledger variables:
- Total Cash in Bank: ${dbState.chartOfAccounts.find(c => c.code === "1010")?.balance.toLocaleString()} ETB
- Active Employees: ${dbState.employees.length} corporate workers.
- Current Sales Orders: ${dbState.salesOrders.length} records.
- Product Catalog SKU Count: ${dbState.products.length} registered.
- AI Advice: To enable full natural language search and deep business analytics, please input a valid GEMINI_API_KEY in the Settings Secrets panel.`
      });
      return;
    }

    try {
      const totalCash = dbState.chartOfAccounts.find(c => c.code === "1010")?.balance || 0;
      const totalAR = dbState.chartOfAccounts.find(c => c.code === "1200")?.balance || 0;
      const totalSales = dbState.salesOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      const activeProjects = dbState.projects.filter(p => p.status === "In Progress").length;
      const employeeList = dbState.employees.map(e => `${e.name} (${e.role}, Dept: ${e.departmentId}, Salary: ${e.salary} ETB)`).join("; ");
      const productsList = dbState.products.map(p => `${p.name} (SKU: ${p.sku}, Price: ${p.price} ETB, Cost: ${p.cost} ETB, Stock Addis: ${p.stock['wh-addis-main'] || 0})`).join("; ");

      const systemInstruction = `
        You are "James ERP AI Analyst", a world-class ERP business consultant and data analyst built for James ERP (an Enterprise Resource Planning platform localized for Ethiopia).
        You have direct real-time access to the company's ledger, inventory databases, employees, and sales records.

        Current Ledger & Database State Summary:
        - Active Company: James Industries Holdings PLC (TIN: 0012457893, Addis Ababa, Sourcing Hubs in Hawassa/Adama).
        - Base Currency: Ethiopian Birr (ETB).
        - Cash in Bank (CBE/Telebirr): ${totalCash} ETB.
        - Accounts Receivable (AR Ledger): ${totalAR} ETB.
        - Total Invoiced/Confirmed Sales: ${totalSales} ETB.
        - Active Workers count: ${dbState.employees.length}. Details: ${employeeList}.
        - Product Inventory Catalog: ${productsList}.
        - Projects in Progress: ${activeProjects}.
        - Tickets Opened: ${dbState.tickets.filter(t => t.status !== "Closed").length}.

        Instructions:
        1. Answer the user's business query directly and professionally using precise figures from the State Summary.
        2. Format all prices and calculations in Ethiopian Birr (ETB) and occasionally USD (using exchange rate 1 USD ~ 122 ETB).
        3. If they ask for sales forecasts, run a mini mathematical projection (linear growth) based on current Sales totals.
        4. If they ask for inventory forecasts or reorder alerts, highlight items where stock level is close to or below reorder points.
        5. Structure your output in beautiful markdown with concise tables or bullet points. Avoid rambling. Avoid technical container port or server logs larping.
      `;

      const chatMessages = [];
      if (history && Array.isArray(history)) {
        history.forEach((h: any) => {
          chatMessages.push({
            role: h.role === "user" ? "user" : "model",
            parts: [{ text: h.content }],
          });
        });
      }
      chatMessages.push({
        role: "user",
        parts: [{ text: prompt }],
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: chatMessages,
        config: {
          systemInstruction,
          temperature: 0.2,
        },
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini ERP Chat Error:", error);
      res.status(500).json({ error: "Gemini AI failed to process query: " + error.message });
    }
  });

  return app;
}
