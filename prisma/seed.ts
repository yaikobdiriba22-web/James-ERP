import "dotenv/config";
import { prisma } from "../src/db/prisma";
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
} from "../src/db/initialData";

const state = {
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

async function main() {
  await prisma.erpState.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default", data: state },
  });
  console.log("James ERP PostgreSQL state initialized.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
