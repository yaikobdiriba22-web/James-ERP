/*
# Create James ERP Core Tables

## Overview
Creates the full database schema for the James ERP platform — a multi-module
enterprise resource planning system covering HR, Finance, Inventory, Sales,
Projects, Assets, Help Desk, and Audit/Notifications.

## New Tables (19 total)

1. **companies** — Top-level business entities (e.g. James Industries Holdings PLC)
2. **branches** — Physical locations belonging to a company
3. **warehouses** — Storage facilities within a branch
4. **departments** — Organizational units within a branch
5. **employees** — Staff records with role, salary, status, and embedded JSON arrays for attendance, leaves, performance reviews, and training
6. **chart_of_accounts** — General ledger accounts (Asset, Liability, Equity, Revenue, Expense)
7. **products** — Inventory items with SKU, pricing, stock levels per warehouse (JSON), reorder points
8. **suppliers** — Vendor records
9. **customers** — Client records
10. **leads** — Sales pipeline prospects
11. **sales_orders** — Customer orders with line items (JSON array)
12. **purchase_orders** — Supplier orders with line items (JSON array)
13. **projects** — Capital projects with milestones (JSON array)
14. **tasks** — Project tasks with assignee, status, priority, time tracking
15. **assets** — Fixed assets with depreciation and maintenance schedule (JSON)
16. **tickets** — Help desk tickets with chat log (JSON array)
17. **audit_logs** — System activity trail
18. **notifications** — In-app user notifications
19. **journal_entries** — Accounting journal entries with line items (JSON array)

## Security

- RLS enabled on every table.
- Policies use `TO anon, authenticated` with `USING (true)` / `WITH CHECK (true)`
  because this app uses its own custom mock-auth system (not Supabase Auth).
  The frontend talks to Supabase with the anon key, so anon must have full CRUD.
  This is intentional shared/single-tenant data — all ERP users see all company data.

## Important Notes

1. All tables use `text` primary keys to preserve existing ID conventions (e.g. "comp-james-holdings", "emp-admin-super").
2. Embedded arrays (attendance, leaves, chat logs, milestones, etc.) are stored as `jsonb` columns to match the existing TypeScript interfaces.
3. Stock levels and maintenance schedules are `jsonb` for flexible warehouse/field mapping.
4. Timestamps use `timestamptz DEFAULT now()`.
*/

-- ============================================
-- COMPANIES
-- ============================================
CREATE TABLE IF NOT EXISTS companies (
  id text PRIMARY KEY,
  name text NOT NULL,
  tin text,
  vat_registered boolean DEFAULT false,
  currency text DEFAULT 'ETB',
  address text,
  phone text,
  email text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_companies" ON companies;
CREATE POLICY "anon_crud_companies" ON companies FOR ALL
  TO anon, authenticated USING (true) WITH CHECK (true);

-- ============================================
-- BRANCHES
-- ============================================
CREATE TABLE IF NOT EXISTS branches (
  id text PRIMARY KEY,
  company_id text NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text,
  phone text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_branches" ON branches;
CREATE POLICY "anon_crud_branches" ON branches FOR ALL
  TO anon, authenticated USING (true) WITH CHECK (true);

-- ============================================
-- WAREHOUSES
-- ============================================
CREATE TABLE IF NOT EXISTS warehouses (
  id text PRIMARY KEY,
  company_id text NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  branch_id text NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_warehouses" ON warehouses;
CREATE POLICY "anon_crud_warehouses" ON warehouses FOR ALL
  TO anon, authenticated USING (true) WITH CHECK (true);

-- ============================================
-- DEPARTMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS departments (
  id text PRIMARY KEY,
  company_id text NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  branch_id text NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  name text NOT NULL,
  manager_id text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_departments" ON departments;
CREATE POLICY "anon_crud_departments" ON departments FOR ALL
  TO anon, authenticated USING (true) WITH CHECK (true);

-- ============================================
-- EMPLOYEES
-- ============================================
CREATE TABLE IF NOT EXISTS employees (
  id text PRIMARY KEY,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  role text NOT NULL,
  department_id text,
  branch_id text,
  company_id text NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  hire_date date,
  salary numeric DEFAULT 0,
  status text DEFAULT 'Active',
  attendance jsonb DEFAULT '[]'::jsonb,
  leaves jsonb DEFAULT '[]'::jsonb,
  performance jsonb DEFAULT '[]'::jsonb,
  training jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_employees" ON employees;
CREATE POLICY "anon_crud_employees" ON employees FOR ALL
  TO anon, authenticated USING (true) WITH CHECK (true);

-- ============================================
-- CHART OF ACCOUNTS
-- ============================================
CREATE TABLE IF NOT EXISTS chart_of_accounts (
  id text PRIMARY KEY,
  company_id text NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  code text NOT NULL,
  name text NOT NULL,
  category text NOT NULL,
  balance numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_chart_of_accounts" ON chart_of_accounts;
CREATE POLICY "anon_crud_chart_of_accounts" ON chart_of_accounts FOR ALL
  TO anon, authenticated USING (true) WITH CHECK (true);

-- ============================================
-- PRODUCTS
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id text PRIMARY KEY,
  company_id text NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  sku text NOT NULL,
  name text NOT NULL,
  category text,
  barcode text,
  qr_code text,
  description text,
  price numeric DEFAULT 0,
  cost numeric DEFAULT 0,
  stock jsonb DEFAULT '{}'::jsonb,
  reorder_point integer DEFAULT 10,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_products" ON products;
CREATE POLICY "anon_crud_products" ON products FOR ALL
  TO anon, authenticated USING (true) WITH CHECK (true);

-- ============================================
-- SUPPLIERS
-- ============================================
CREATE TABLE IF NOT EXISTS suppliers (
  id text PRIMARY KEY,
  company_id text NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  contact_person text,
  phone text,
  email text,
  tin text,
  address text,
  products_supplied jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_suppliers" ON suppliers;
CREATE POLICY "anon_crud_suppliers" ON suppliers FOR ALL
  TO anon, authenticated USING (true) WITH CHECK (true);

-- ============================================
-- CUSTOMERS
-- ============================================
CREATE TABLE IF NOT EXISTS customers (
  id text PRIMARY KEY,
  company_id text NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  contact_person text,
  phone text,
  email text,
  tin text,
  address text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_customers" ON customers;
CREATE POLICY "anon_crud_customers" ON customers FOR ALL
  TO anon, authenticated USING (true) WITH CHECK (true);

-- ============================================
-- LEADS
-- ============================================
CREATE TABLE IF NOT EXISTS leads (
  id text PRIMARY KEY,
  company_id text NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name text,
  company text,
  email text,
  phone text,
  status text DEFAULT 'New',
  source text DEFAULT 'Web',
  assigned_to_id text,
  assigned_to_name text,
  stage text,
  contact_name text,
  value numeric,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_leads" ON leads;
CREATE POLICY "anon_crud_leads" ON leads FOR ALL
  TO anon, authenticated USING (true) WITH CHECK (true);

-- ============================================
-- SALES ORDERS
-- ============================================
CREATE TABLE IF NOT EXISTS sales_orders (
  id text PRIMARY KEY,
  company_id text NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  branch_id text,
  customer_id text,
  customer_name text,
  date date,
  items jsonb DEFAULT '[]'::jsonb,
  total_amount numeric DEFAULT 0,
  status text DEFAULT 'Draft',
  shipping_address text,
  payment_method text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE sales_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_sales_orders" ON sales_orders;
CREATE POLICY "anon_crud_sales_orders" ON sales_orders FOR ALL
  TO anon, authenticated USING (true) WITH CHECK (true);

-- ============================================
-- PURCHASE ORDERS
-- ============================================
CREATE TABLE IF NOT EXISTS purchase_orders (
  id text PRIMARY KEY,
  company_id text NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  supplier_id text,
  supplier_name text,
  date date,
  items jsonb DEFAULT '[]'::jsonb,
  total_amount numeric DEFAULT 0,
  status text DEFAULT 'Draft',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_purchase_orders" ON purchase_orders;
CREATE POLICY "anon_crud_purchase_orders" ON purchase_orders FOR ALL
  TO anon, authenticated USING (true) WITH CHECK (true);

-- ============================================
-- PROJECTS
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
  id text PRIMARY KEY,
  company_id text NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  start_date date,
  end_date date,
  status text DEFAULT 'Planning',
  manager_id text,
  manager_name text,
  budget numeric DEFAULT 0,
  milestones jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_projects" ON projects;
CREATE POLICY "anon_crud_projects" ON projects FOR ALL
  TO anon, authenticated USING (true) WITH CHECK (true);

-- ============================================
-- TASKS
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
  id text PRIMARY KEY,
  project_id text NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  project_name text,
  title text NOT NULL,
  description text,
  assignee_id text,
  assignee_name text,
  start_date date,
  due_date date,
  status text DEFAULT 'Todo',
  priority text DEFAULT 'Medium',
  time_spent_minutes integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_tasks" ON tasks;
CREATE POLICY "anon_crud_tasks" ON tasks FOR ALL
  TO anon, authenticated USING (true) WITH CHECK (true);

-- ============================================
-- ASSETS
-- ============================================
CREATE TABLE IF NOT EXISTS assets (
  id text PRIMARY KEY,
  company_id text NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  branch_id text,
  name text NOT NULL,
  category text,
  cost numeric DEFAULT 0,
  acquisition_date date,
  salvage_value numeric DEFAULT 0,
  useful_life_years integer,
  accumulated_depreciation numeric DEFAULT 0,
  assigned_to_id text,
  assigned_to_name text,
  maintenance_schedule jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_assets" ON assets;
CREATE POLICY "anon_crud_assets" ON assets FOR ALL
  TO anon, authenticated USING (true) WITH CHECK (true);

-- ============================================
-- TICKETS
-- ============================================
CREATE TABLE IF NOT EXISTS tickets (
  id text PRIMARY KEY,
  company_id text NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  customer_id text,
  customer_name text,
  subject text NOT NULL,
  description text,
  category text,
  priority text DEFAULT 'Medium',
  status text DEFAULT 'Open',
  created_at timestamptz DEFAULT now(),
  assigned_to_id text,
  assigned_to_name text,
  chat_log jsonb DEFAULT '[]'::jsonb
);
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_tickets" ON tickets;
CREATE POLICY "anon_crud_tickets" ON tickets FOR ALL
  TO anon, authenticated USING (true) WITH CHECK (true);

-- ============================================
-- AUDIT LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id text PRIMARY KEY,
  company_id text,
  user_id text,
  user_name text,
  user_role text,
  action text,
  details text,
  ip_address text,
  timestamp timestamptz DEFAULT now()
);
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_audit_logs" ON audit_logs;
CREATE POLICY "anon_crud_audit_logs" ON audit_logs FOR ALL
  TO anon, authenticated USING (true) WITH CHECK (true);

-- ============================================
-- NOTIFICATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id text PRIMARY KEY,
  user_id text,
  title text,
  content text,
  type text DEFAULT 'In-App',
  category text DEFAULT 'System',
  status text DEFAULT 'Unread',
  timestamp timestamptz DEFAULT now()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_notifications" ON notifications;
CREATE POLICY "anon_crud_notifications" ON notifications FOR ALL
  TO anon, authenticated USING (true) WITH CHECK (true);

-- ============================================
-- JOURNAL ENTRIES
-- ============================================
CREATE TABLE IF NOT EXISTS journal_entries (
  id text PRIMARY KEY,
  company_id text NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  branch_id text,
  date date,
  description text,
  reference text,
  items jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'Draft',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_journal_entries" ON journal_entries;
CREATE POLICY "anon_crud_journal_entries" ON journal_entries FOR ALL
  TO anon, authenticated USING (true) WITH CHECK (true);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_employees_company ON employees(company_id);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_products_company ON products(company_id);
CREATE INDEX IF NOT EXISTS idx_sales_orders_company ON sales_orders(company_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_company ON purchase_orders(company_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tickets_company ON tickets(company_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_company ON audit_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_company ON journal_entries(company_id);
